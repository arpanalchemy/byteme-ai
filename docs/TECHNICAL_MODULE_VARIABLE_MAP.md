# Technical Module Variable Map - Backend Focus

## PostgreSQL (SQL Data) + MongoDB (Logs)

---

## 🔐 Authentication & User Management Module

### PostgreSQL Tables & Variables

#### users

- id (UUID, Primary Key)
- wallet_address (VARCHAR(42)) - VeChain wallet address
- email (VARCHAR(255)) - Optional for notifications
- username (VARCHAR(100)) - Display name
- profile_image (VARCHAR(500)) - Avatar URL
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login_at (TIMESTAMP)
- is_active (BOOLEAN)
- is_verified (BOOLEAN) - Wallet verification status
- verification_level (ENUM: basic, verified, premium)
- total_mileage (DECIMAL(10,2)) - Lifetime mileage
- total_rewards (DECIMAL(18,8)) - Total B3TR earned
- sustainability_score (INTEGER) - 0-100

#### user_sessions

- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- session_token (VARCHAR(255)) - JWT token
- refresh_token (VARCHAR(255))
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
- ip_address (VARCHAR(45))
- user_agent (TEXT)
- is_active (BOOLEAN)
- last_activity (TIMESTAMP)

#### user_preferences

- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- notification_preferences (JSONB) - Email, SMS, push settings
- dashboard_settings (JSONB) - Theme, language, privacy
- reward_preferences (JSONB) - Auto-claim, limits
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### user_wallets

- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- wallet_address (VARCHAR(42))
- wallet_type (ENUM: vechain, ethereum, polygon)
- network (ENUM: mainnet, testnet)
- is_primary (BOOLEAN)
- balance (DECIMAL(18,8)) - Current B3TR balance
- last_sync_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### MongoDB Collections & Variables

#### auth_logs

- \_id (ObjectId)
- user_id (String)
- action (String) - login, logout, wallet_connect, verification
- wallet_address (String)
- ip_address (String)
- user_agent (String)
- success (Boolean)
- error_message (String) - if failed
- session_duration (Number) - milliseconds
- timestamp (Date)
- metadata (Object) - Additional context

#### security_events

- \_id (ObjectId)
- user_id (String)
- event_type (String) - failed_login, suspicious_activity, account_locked
- severity (String) - low, medium, high, critical
- ip_address (String)
- location_data (Object) - Country, city, coordinates
- device_info (Object) - Browser, OS, device type
- timestamp (Date)
- resolved (Boolean)
- admin_notes (String)

---

## 📸 Odometer Photo Upload Module

### PostgreSQL Tables & Variables

#### odometer_uploads

- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- image_url (VARCHAR(500)) - Cloud storage URL
- image_hash (VARCHAR(64)) - SHA256 for duplicate detection
- original_filename (VARCHAR(255))
- file_size (INTEGER) - Bytes
- mime_type (VARCHAR(100))
- image_dimensions (JSONB) - Width, height
- upload_status (ENUM: uploaded, processing, verified, rejected, failed)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- processed_at (TIMESTAMP)

#### mileage_data

- id (UUID, Primary Key)
- upload_id (UUID, Foreign Key)
- user_claimed_mileage (DECIMAL(10,2))
- ai_verified_mileage (DECIMAL(10,2))
- final_mileage (DECIMAL(10,2)) - Approved mileage
- mileage_confidence (DECIMAL(3,2)) - 0.00-1.00 AI confidence
- mileage_unit (ENUM: km, miles)
- previous_mileage (DECIMAL(10,2)) - Last verified mileage
- distance_traveled (DECIMAL(10,2)) - Calculated distance
- verification_status (ENUM: pending, approved, rejected, manual_review)
- rejection_reason (TEXT) - If rejected
- manual_review_notes (TEXT)
- reviewed_by (UUID) - Admin user ID
- reviewed_at (TIMESTAMP)

#### upload_verifications

- id (UUID, Primary Key)
- upload_id (UUID, Foreign Key)
- ai_service_used (VARCHAR(100)) - Service provider name
- processing_time (INTEGER) - Milliseconds
- confidence_score (DECIMAL(3,2)) - 0.00-1.00
- detected_text (TEXT) - Raw OCR text
- bounding_boxes (JSONB) - OCR bounding boxes
- image_quality_score (DECIMAL(3,2)) - 0.00-1.00
- lighting_conditions (ENUM: good, fair, poor)
- blur_detected (BOOLEAN)
- glare_detected (BOOLEAN)
- multiple_readings_detected (BOOLEAN)
- fallback_used (BOOLEAN) - If primary AI failed
- error_details (TEXT) - If processing failed
- created_at (TIMESTAMP)

### MongoDB Collections & Variables

#### upload_processing_logs

- \_id (ObjectId)
- upload_id (String)
- user_id (String)
- processing_stage (String) - upload, validation, ai_processing, verification
- stage_duration (Number) - milliseconds
- success (Boolean)
- error_message (String) - if failed
- file_size (Number) - bytes
- image_dimensions (Object) - width, height
- processing_metadata (Object) - Additional processing info
- timestamp (Date)
- retry_count (Number)

#### ai_processing_logs

- \_id (ObjectId)
- upload_id (String)
- ai_service_name (String) - Google Vision, AWS Rekognition, etc.
- service_endpoint (String) - API endpoint
- request_payload (Object) - Input data sent to AI service
- response_payload (Object) - Output data from AI service
- processing_time (Number) - milliseconds
- success (Boolean)
- confidence_score (Number) - 0.00-1.00
- error_details (String) - if failed
- fallback_used (Boolean) - If primary service failed
- cost_incurred (Number) - API cost in USD
- timestamp (Date)
- service_metadata (Object) - Service-specific data

#### image_quality_logs

- \_id (ObjectId)
- upload_id (String)
- quality_metrics (Object) - Brightness, contrast, sharpness scores
- detected_issues (Array) - Blur, glare, poor lighting
- preprocessing_applied (Array) - Resize, compression, format conversion
- original_file_info (Object) - Size, format, dimensions
- processed_file_info (Object) - Final size, format, dimensions
- timestamp (Date)

---

## 🎁 Reward Calculation & Distribution Module

### PostgreSQL Tables & Variables

#### rewards

- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- upload_id (UUID, Foreign Key)
- base_amount (DECIMAL(18,8)) - Calculated reward amount
- bonus_amount (DECIMAL(18,8)) - Bonus rewards
- total_amount (DECIMAL(18,8)) - Final reward amount
- reward_rate (DECIMAL(10,4)) - B3TR per km
- distance_traveled (DECIMAL(10,2)) - Km traveled
- calculation_factors (JSONB) - Base rate, bonuses, multipliers
- status (ENUM: calculated, pending, distributed, failed, cancelled)
- calculated_at (TIMESTAMP)
- distributed_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### reward_transactions

- id (UUID, Primary Key)
- reward_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- blockchain_tx_hash (VARCHAR(66)) - Transaction hash
- blockchain_network (ENUM: vechain_mainnet, vechain_testnet)
- contract_address (VARCHAR(42)) - Smart contract address
- from_address (VARCHAR(42)) - Platform wallet
- to_address (VARCHAR(42)) - User wallet
- amount (DECIMAL(18,8)) - B3TR amount
- gas_used (INTEGER) - Gas units used
- gas_price (DECIMAL(18,8)) - Gas price in VTHO
- transaction_fee (DECIMAL(18,8)) - Total fee in VTHO
- block_number (INTEGER)
- confirmation_count (INTEGER)
- status (ENUM: pending, confirmed, failed, reverted)
- error_message (TEXT) - If failed
- retry_count (INTEGER)
- max_retries (INTEGER) - 3
- created_at (TIMESTAMP)
- confirmed_at (TIMESTAMP)

#### reward_limits

- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- limit_type (ENUM: daily, weekly, monthly)
- limit_amount (DECIMAL(18,8)) - Maximum B3TR allowed
- current_amount (DECIMAL(18,8)) - Current period total
- period_start (TIMESTAMP)
- period_end (TIMESTAMP)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### smart_contracts

- id (UUID, Primary Key)
- contract_name (VARCHAR(100)) - B3TR Token Contract
- contract_address (VARCHAR(42))
- contract_type (ENUM: token, reward_distributor, governance)
- network (ENUM: mainnet, testnet)
- abi_version (VARCHAR(20))
- deployed_at (TIMESTAMP)
- is_active (BOOLEAN)
- total_supply (DECIMAL(18,8))
- circulating_supply (DECIMAL(18,8))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### MongoDB Collections & Variables

#### reward_calculation_logs

- \_id (ObjectId)
- reward_id (String)
- user_id (String)
- upload_id (String)
- calculation_input (Object) - Distance, base rate, bonuses
- calculation_steps (Array) - Step-by-step calculation process
- calculation_result (Object) - Final amounts and factors
- calculation_duration (Number) - milliseconds
- success (Boolean)
- error_message (String) - if failed
- timestamp (Date)

#### blockchain_transaction_logs

- \_id (ObjectId)
- transaction_id (String)
- reward_id (String)
- user_id (String)
- transaction_type (String) - reward_distribution, token_transfer
- blockchain_network (String) - vechain_mainnet, vechain_testnet
- tx_hash (String)
- gas_estimation (Object) - Estimated gas, actual gas, gas price
- transaction_status (String) - pending, confirmed, failed
- confirmation_blocks (Number) - Blocks to confirmation
- error_details (String) - if failed
- retry_attempts (Number)
- timestamp (Date)
- blockchain_metadata (Object) - Additional blockchain data

#### gas_optimization_logs

- \_id (ObjectId)
- transaction_id (String)
- gas_strategy (String) - low, medium, high
- estimated_gas (Number)
- actual_gas (Number)
- gas_price_used (Number)
- gas_savings (Number) - Compared to default
- optimization_method (String) - Batch processing, gas estimation
- timestamp (Date)

---

## 🤖 AI & Image Processing Module

### PostgreSQL Tables & Variables

#### ai_service_configs

- id (UUID, Primary Key)
- service_name (VARCHAR(100)) - Google Vision, AWS Rekognition, etc.
- service_type (ENUM: ocr, image_recognition, object_detection)
- api_key (VARCHAR(500)) - Encrypted
- api_secret (VARCHAR(500)) - Encrypted
- endpoint_url (VARCHAR(500))
- is_active (BOOLEAN)
- priority (INTEGER) - 1-10, lower is higher priority
- rate_limit (JSONB) - Requests per minute/hour/day
- cost_per_request (DECIMAL(10,4)) - USD
- accuracy_threshold (DECIMAL(3,2)) - Minimum confidence
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### ai_models

- id (UUID, Primary Key)
- model_name (VARCHAR(100))
- model_version (VARCHAR(20))
- model_type (ENUM: ocr, image_classification, object_detection)
- accuracy_score (DECIMAL(3,2)) - 0.00-1.00
- processing_speed (INTEGER) - Milliseconds per image
- model_size (INTEGER) - MB
- is_active (BOOLEAN)
- deployment_date (TIMESTAMP)
- last_updated (TIMESTAMP)
- created_at (TIMESTAMP)

#### ai_performance_metrics

- id (UUID, Primary Key)
- service_name (VARCHAR(100))
- metric_type (ENUM: accuracy, speed, cost, availability)
- metric_value (DECIMAL(10,4))
- metric_unit (VARCHAR(20))
- sample_size (INTEGER) - Number of requests
- time_period (ENUM: hour, day, week, month)
- period_start (TIMESTAMP)
- period_end (TIMESTAMP)
- created_at (TIMESTAMP)

### MongoDB Collections & Variables

#### ai_service_logs

- \_id (ObjectId)
- service_name (String)
- request_id (String)
- upload_id (String)
- request_type (String) - ocr, image_analysis, quality_check
- request_payload (Object) - Image data, parameters
- response_payload (Object) - AI results, confidence scores
- processing_time (Number) - milliseconds
- success (Boolean)
- error_code (String) - if failed
- error_message (String) - if failed
- cost_incurred (Number) - USD
- timestamp (Date)
- service_metadata (Object) - Service-specific data

#### model_performance_logs

- \_id (ObjectId)
- model_name (String)
- model_version (String)
- accuracy_metrics (Object) - Precision, recall, F1-score
- speed_metrics (Object) - Average processing time, throughput
- resource_usage (Object) - CPU, memory, GPU usage
- error_rates (Object) - Different types of errors
- timestamp (Date)
- sample_size (Number)

#### fallback_logs

- \_id (ObjectId)
- primary_service (String)
- fallback_service (String)
- trigger_reason (String) - Timeout, error, low confidence
- primary_error (String) - Error from primary service
- fallback_success (Boolean)
- fallback_result (Object) - Results from fallback service
- timestamp (Date)

---

## ⛓️ Blockchain Integration Module

### PostgreSQL Tables & Variables

#### blockchain_transactions

- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- transaction_type (ENUM: reward_distribution, token_transfer, contract_interaction)
- tx_hash (VARCHAR(66)) - Transaction hash
- blockchain_network (ENUM: vechain_mainnet, vechain_testnet)
- from_address (VARCHAR(42)) - Sender address
- to_address (VARCHAR(42)) - Recipient address
- amount (DECIMAL(18,8)) - Token amount
- gas_used (INTEGER) - Gas units used
- gas_price (DECIMAL(18,8)) - Gas price in VTHO
- transaction_fee (DECIMAL(18,8)) - Total fee
- block_number (INTEGER)
- block_timestamp (TIMESTAMP)
- confirmation_count (INTEGER)
- required_confirmations (INTEGER) - 12
- status (ENUM: pending, confirmed, failed, reverted)
- error_message (TEXT) - If failed
- retry_count (INTEGER)
- max_retries (INTEGER) - 3
- created_at (TIMESTAMP)
- confirmed_at (TIMESTAMP)

#### smart_contracts

- id (UUID, Primary Key)
- contract_name (VARCHAR(100))
- contract_address (VARCHAR(42))
- contract_type (ENUM: token, reward_distributor, governance, staking)
- network (ENUM: mainnet, testnet)
- abi_version (VARCHAR(20))
- bytecode (TEXT) - Contract bytecode
- abi (JSONB) - Contract ABI
- deployed_at (TIMESTAMP)
- deployed_by (VARCHAR(42)) - Deployer address
- is_active (BOOLEAN)
- total_supply (DECIMAL(18,8))
- circulating_supply (DECIMAL(18,8))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### blockchain_events

- id (UUID, Primary Key)
- contract_address (VARCHAR(42))
- event_type (VARCHAR(100)) - Transfer, RewardDistributed, etc.
- event_signature (VARCHAR(66)) - Event signature hash
- block_number (INTEGER)
- block_timestamp (TIMESTAMP)
- tx_hash (VARCHAR(66))
- log_index (INTEGER)
- event_data (JSONB) - Decoded event data
- processed (BOOLEAN) - If processed by application
- processed_at (TIMESTAMP)
- created_at (TIMESTAMP)

#### network_configs

- id (UUID, Primary Key)
- network_name (ENUM: vechain_mainnet, vechain_testnet)
- rpc_url (VARCHAR(500))
- websocket_url (VARCHAR(500))
- chain_id (INTEGER)
- block_time (INTEGER) - Seconds per block
- gas_limit (INTEGER) - Default gas limit
- gas_price (DECIMAL(18,8)) - Default gas price
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### MongoDB Collections & Variables

#### blockchain_connection_logs

- \_id (ObjectId)
- network_name (String)
- connection_type (String) - rpc, websocket
- connection_status (String) - connected, disconnected, failed
- response_time (Number) - milliseconds
- error_message (String) - if failed
- timestamp (Date)
- retry_count (Number)

#### transaction_monitoring_logs

- \_id (ObjectId)
- tx_hash (String)
- transaction_type (String)
- monitoring_stage (String) - submitted, pending, confirmed
- confirmation_blocks (Number)
- gas_used (Number)
- gas_price (Number)
- block_number (Number)
- timestamp (Date)
- status_updates (Array) - History of status changes

#### contract_interaction_logs

- \_id (ObjectId)
- contract_address (String)
- contract_name (String)
- method_name (String) - Function called
- parameters (Object) - Function parameters
- gas_estimated (Number)
- gas_used (Number)
- success (Boolean)
- return_value (Object) - Function return value
- error_message (String) - if failed
- timestamp (Date)

#### gas_optimization_logs

- \_id (ObjectId)
- transaction_id (String)
- gas_strategy (String) - low, medium, high
- estimated_gas (Number)
- actual_gas (Number)
- gas_price_used (Number)
- gas_savings (Number) - Compared to default
- optimization_method (String) - Batch processing, gas estimation
- timestamp (Date)

---

## 📈 Analytics & Reporting Module

### PostgreSQL Tables & Variables

#### analytics_data

- id (UUID, Primary Key)
- metric_type (ENUM: user_engagement, reward_distribution, sustainability_impact, system_performance)
- metric_name (VARCHAR(100))
- metric_value (DECIMAL(15,4))
- metric_unit (VARCHAR(20))
- dimension (JSONB) - Time, user_type, region, etc.
- time_period (ENUM: hour, day, week, month, year)
- period_start (TIMESTAMP)
- period_end (TIMESTAMP)
- user_id (UUID) - If user-specific
- created_at (TIMESTAMP)

#### reports

- id (UUID, Primary Key)
- report_type (ENUM: user_activity, reward_summary, sustainability_impact, system_health)
- report_name (VARCHAR(200))
- report_period (ENUM: daily, weekly, monthly, quarterly, yearly)
- period_start (DATE)
- period_end (DATE)
- generated_by (UUID) - User ID
- report_data (JSONB) - Report content
- file_url (VARCHAR(500)) - PDF/CSV file URL
- status (ENUM: generating, completed, failed)
- created_at (TIMESTAMP)
- completed_at (TIMESTAMP)

#### insights

- id (UUID, Primary Key)
- insight_type (ENUM: user_behavior, trend_analysis, anomaly_detection, recommendation)
- insight_title (VARCHAR(200))
- insight_description (TEXT)
- insight_data (JSONB) - Supporting data
- confidence_score (DECIMAL(3,2)) - 0.00-1.00
- impact_score (ENUM: low, medium, high, critical)
- applicable_users (JSONB) - User segments
- action_items (JSONB) - Recommended actions
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP)

#### metrics_cache

- id (UUID, Primary Key)
- cache_key (VARCHAR(200)) - Unique cache key
- cache_data (JSONB) - Cached data
- cache_type (ENUM: user_metrics, system_metrics, analytics)
- ttl (INTEGER) - Time to live in seconds
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP)
- last_accessed (TIMESTAMP)

### MongoDB Collections & Variables

#### analytics_processing_logs

- \_id (ObjectId)
- metric_type (String)
- metric_name (String)
- processing_stage (String) - aggregation, calculation, caching
- processing_duration (Number) - milliseconds
- data_points_processed (Number)
- success (Boolean)
- error_message (String) - if failed
- timestamp (Date)
- processing_metadata (Object) - Additional processing info

#### report_generation_logs

- \_id (ObjectId)
- report_id (String)
- report_type (String)
- generation_stage (String) - data_collection, processing, formatting
- generation_duration (Number) - milliseconds
- file_size (Number) - bytes
- success (Boolean)
- error_message (String) - if failed
- timestamp (Date)
- report_metadata (Object) - Report-specific data

#### insight_generation_logs

- \_id (ObjectId)
- insight_id (String)
- insight_type (String)
- generation_method (String) - ml_model, rule_based, statistical
- confidence_score (Number) - 0.00-1.00
- data_sources (Array) - Sources used for insight
- generation_duration (Number) - milliseconds
- timestamp (Date)
- insight_metadata (Object) - Insight-specific data

#### cache_performance_logs

- \_id (ObjectId)
- cache_key (String)
- cache_type (String)
- operation (String) - get, set, delete, expire
- hit_miss (String) - hit, miss
- response_time (Number) - milliseconds
- cache_size (Number) - bytes
- timestamp (Date)

---

## 🔄 Cross-Module Integration Variables

### PostgreSQL Tables & Variables

#### system_config

- id (UUID, Primary Key)
- environment (ENUM: development, staging, production)
- version (VARCHAR(20))
- maintenance_mode (BOOLEAN) - false
- feature_flags (JSONB) - AI verification, blockchain integration, etc.
- rate_limits (JSONB) - API requests, uploads, claims
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### system_audit_logs

- id (UUID, Primary Key)
- user_id (UUID) - If user action
- action (VARCHAR(100))
- module (VARCHAR(50)) - Module name
- action_details (JSONB)
- ip_address (VARCHAR(45))
- user_agent (TEXT)
- timestamp (TIMESTAMP)
- severity (ENUM: info, warning, error, critical)

### MongoDB Collections & Variables

#### system_performance_logs

- \_id (ObjectId)
- module_name (String)
- operation (String) - api_call, database_query, external_service
- response_time (Number) - milliseconds
- success (Boolean)
- error_message (String) - if failed
- resource_usage (Object) - CPU, memory, database connections
- timestamp (Date)
- metadata (Object) - Additional context

#### error_logs

- \_id (ObjectId)
- error_type (String) - validation, database, external_service, system
- error_code (String)
- error_message (String)
- stack_trace (String)
- user_id (String) - if applicable
- module (String)
- severity (String) - low, medium, high, critical
- timestamp (Date)
- resolved (Boolean)
- resolution_notes (String)

#### integration_logs

- \_id (ObjectId)
- integration_type (String) - ai_service, blockchain, external_api
- service_name (String)
- request_id (String)
- request_data (Object)
- response_data (Object)
- response_time (Number) - milliseconds
- success (Boolean)
- error_details (String) - if failed
- retry_count (Number)
- timestamp (Date)

This technical variable map provides a focused view of all data structures needed for backend development, with PostgreSQL handling structured SQL data and MongoDB managing logs and performance metrics.
