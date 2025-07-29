import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SupportService } from "../services/support.service";
import { ContactSupportDto } from "../dto/contact-support.dto";
import { Public } from "../../../common/decorators/public.decorator";

@ApiTags("Support")
@Controller("support")
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post("contact")
  @Public()
  @ApiOperation({
    summary: "Submit a support request",
    description: "Submit a support request through the contact form",
  })
  @ApiResponse({
    status: 200,
    description: "Support request submitted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  async submitSupportRequest(
    @Body() supportRequest: ContactSupportDto,
  ): Promise<{ message: string }> {
    return this.supportService.submitSupportRequest(supportRequest);
  }
}
