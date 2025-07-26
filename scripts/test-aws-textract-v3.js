const {
  TextractClient,
  DetectDocumentTextCommand,
} = require("@aws-sdk/client-textract");
const fs = require("fs");
const path = require("path");

// Configure AWS v3 client
const textract = new TextractClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Mock the smart filtering logic from the service
function findOdometerReading(blocks) {
  const wordBlocks = blocks.filter(
    (block) => block.BlockType === "WORD" && block.Text
  );

  console.log(`Processing ${wordBlocks.length} word blocks`);

  // Method 1: Pure number detection (5-7 digits)
  const pureNumbers = findPureNumbers(wordBlocks);
  if (pureNumbers.length > 0) {
    console.log(`Found ${pureNumbers.length} pure number candidates`);
    return selectBestOdometer(pureNumbers, "pure_number");
  }

  // Method 2: Look for numbers near "MILE", "KM", "ODO" labels
  const labeledNumbers = findLabeledNumbers(wordBlocks);
  if (labeledNumbers.length > 0) {
    console.log(`Found ${labeledNumbers.length} labeled number candidates`);
    return selectBestOdometer(labeledNumbers, "labeled_number");
  }

  // Method 3: Position-based detection (center/right area)
  const positionedNumbers = findPositionedNumbers(wordBlocks);
  if (positionedNumbers.length > 0) {
    console.log(
      `Found ${positionedNumbers.length} positioned number candidates`
    );
    return selectBestOdometer(positionedNumbers, "positioned_number");
  }

  // Method 4: Any number with high confidence
  const highConfidenceNumbers = findHighConfidenceNumbers(wordBlocks);
  if (highConfidenceNumbers.length > 0) {
    console.log(
      `Found ${highConfidenceNumbers.length} high confidence number candidates`
    );
    return selectBestOdometer(highConfidenceNumbers, "high_confidence");
  }

  return null;
}

function findPureNumbers(blocks) {
  return blocks.filter((block) => {
    if (!block.Text || !block.Confidence) return false;
    const text = block.Text.replace(/[^\d]/g, "");
    return /^\d{5,7}$/.test(text) && block.Confidence > 85;
  });
}

function findLabeledNumbers(blocks) {
  const odometerLabels = ["MILE", "KM", "ODO", "ODOMETER", "TOTAL", "TRIP"];
  const labelBlocks = blocks.filter(
    (block) =>
      block.Text &&
      odometerLabels.some((label) => block.Text.toUpperCase().includes(label))
  );

  return blocks.filter((block) => {
    if (!block.Text || !block.Confidence) return false;
    const text = block.Text.replace(/[^\d]/g, "");
    if (!/^\d{4,7}$/.test(text) || block.Confidence < 80) return false;

    // Check if number is near a label (within reasonable distance)
    return labelBlocks.some(
      (labelBlock) => isNearby(block, labelBlock, 0.1) // 10% of image width/height
    );
  });
}

function findPositionedNumbers(blocks) {
  return blocks.filter((block) => {
    if (!block.Text || !block.Confidence || !block.Geometry?.BoundingBox)
      return false;
    const text = block.Text.replace(/[^\d]/g, "");
    if (!/^\d{4,7}$/.test(text) || block.Confidence < 75) return false;

    const bbox = block.Geometry.BoundingBox;

    // Odometer typically in center-right area
    const isInOdometerArea =
      bbox.Left > 0.3 &&
      bbox.Left < 0.9 && // Right side
      bbox.Top > 0.2 &&
      bbox.Top < 0.8; // Center area

    return isInOdometerArea;
  });
}

function findHighConfidenceNumbers(blocks) {
  return blocks.filter((block) => {
    if (!block.Text || !block.Confidence) return false;
    const text = block.Text.replace(/[^\d]/g, "");
    return /^\d{4,7}$/.test(text) && block.Confidence > 95;
  });
}

function isNearby(block1, block2, threshold) {
  const bbox1 = block1.Geometry?.BoundingBox;
  const bbox2 = block2.Geometry?.BoundingBox;

  if (!bbox1 || !bbox2) return false;

  const distanceX = Math.abs((bbox1.Left || 0) - (bbox2.Left || 0));
  const distanceY = Math.abs((bbox1.Top || 0) - (bbox2.Top || 0));

  return distanceX < threshold && distanceY < threshold;
}

function selectBestOdometer(candidates, method) {
  // Sort by confidence, then by number length (prefer longer numbers)
  const sortedCandidates = candidates.sort((a, b) => {
    if (Math.abs((a.Confidence || 0) - (b.Confidence || 0)) > 5) {
      return (b.Confidence || 0) - (a.Confidence || 0);
    }
    return (b.Text?.length || 0) - (a.Text?.length || 0);
  });

  const bestCandidate = sortedCandidates[0];
  const mileage = parseInt((bestCandidate.Text || "").replace(/[^\d]/g, ""));

  return {
    mileage,
    confidence: bestCandidate.Confidence || 0,
    rawText: bestCandidate.Text || "",
    boundingBox: {
      left: bestCandidate.Geometry?.BoundingBox?.Left || 0,
      top: bestCandidate.Geometry?.BoundingBox?.Top || 0,
      width: bestCandidate.Geometry?.BoundingBox?.Width || 0,
      height: bestCandidate.Geometry?.BoundingBox?.Height || 0,
    },
    detectionMethod: method,
  };
}

async function testTextractWithImage(imagePath) {
  try {
    console.log(`\n🔍 Testing AWS Textract v3 with: ${imagePath}`);

    // Read image file
    const imageBuffer = fs.readFileSync(imagePath);

    // Call AWS Textract v3
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: imageBuffer,
      },
    });

    const textractResponse = await textract.send(command);

    console.log(
      `📊 Textract processed ${textractResponse.Blocks?.length || 0} blocks`
    );

    // Extract odometer reading using smart filtering
    const odometerResult = findOdometerReading(textractResponse.Blocks || []);

    if (odometerResult) {
      console.log(`✅ Odometer detected: ${odometerResult.mileage} miles`);
      console.log(`   Confidence: ${odometerResult.confidence}%`);
      console.log(`   Raw text: "${odometerResult.rawText}"`);
      console.log(`   Detection method: ${odometerResult.detectionMethod}`);
      console.log(
        `   Position: (${odometerResult.boundingBox.left.toFixed(3)}, ${odometerResult.boundingBox.top.toFixed(3)})`
      );
    } else {
      console.log(`❌ No valid odometer reading found`);
    }

    // Show all detected text for debugging
    console.log("\n📝 All detected text:");
    const wordBlocks =
      textractResponse.Blocks?.filter((block) => block.BlockType === "WORD") ||
      [];
    wordBlocks.forEach((block) => {
      console.log(`   "${block.Text}" (confidence: ${block.Confidence}%)`);
    });

    return odometerResult;
  } catch (error) {
    console.error(`❌ Error processing image: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("🚗 AWS Textract v3 Odometer OCR Test");
  console.log("=====================================");

  // Check if AWS credentials are set
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("❌ AWS credentials not found. Please set:");
    console.error("   AWS_ACCESS_KEY_ID");
    console.error("   AWS_SECRET_ACCESS_KEY");
    console.error("   AWS_REGION (optional, defaults to us-east-1)");
    process.exit(1);
  }

  console.log("✅ AWS SDK v3 configured successfully");
  console.log(`🌍 Region: ${process.env.AWS_REGION || "us-east-1"}`);

  // Test with sample images if available
  const testImages = [
    "test-images/odometer1.jpg",
    "test-images/odometer2.jpg",
    "test-images/odometer3.jpg",
  ];

  for (const imagePath of testImages) {
    if (fs.existsSync(imagePath)) {
      await testTextractWithImage(imagePath);
    } else {
      console.log(`\n⚠️  Test image not found: ${imagePath}`);
      console.log(
        "   Create a test-images/ directory with odometer photos to test"
      );
    }
  }

  console.log("\n✨ Test completed!");
  console.log("\nTo test with your own images:");
  console.log("1. Create a test-images/ directory");
  console.log("2. Add odometer photos (JPG/PNG)");
  console.log("3. Run this script again");
  console.log("\n📚 AWS SDK v3 Benefits:");
  console.log("   - Modular imports (smaller bundle size)");
  console.log("   - Better TypeScript support");
  console.log("   - Improved error handling");
  console.log("   - No more deprecation warnings");
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testTextractWithImage, findOdometerReading };
