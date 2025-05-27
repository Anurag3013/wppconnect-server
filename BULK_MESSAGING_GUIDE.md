# WPPConnect Bulk Messaging Guide

This guide explains how to send messages to multiple WhatsApp contacts simultaneously using the WPPConnect server.

## Available Bulk Messaging APIs

### 1. Enhanced Send Message (supports both single and multiple contacts)

**Endpoint:** `POST /api/{session}/send-message`

This existing endpoint now supports both single contacts and multiple contacts through arrays.

#### Single Contact Example:

```json
{
  "phone": "5521999999999",
  "message": "Hello from WPPConnect!",
  "isGroup": false
}
```

#### Multiple Contacts Example:

```json
{
  "phone": ["5521999999999", "5521888888888", "5521777777777"],
  "message": "Hello to multiple contacts!",
  "isGroup": false
}
```

### 2. Dedicated Bulk Message API

**Endpoint:** `POST /api/{session}/send-bulk-message`

This new endpoint is specifically designed for bulk messaging with enhanced features:

#### Request Body:

```json
{
  "phones": ["5521999999999", "5521888888888", "5521777777777"],
  "message": "Your bulk message here",
  "delay": 2000,
  "options": {
    "quotedMsg": "optional_message_id_to_reply_to"
  }
}
```

#### Parameters:

- `phones` (required): Array of phone numbers
- `message` (required): The message text to send
- `delay` (optional): Delay in milliseconds between messages (default: 1000ms)
- `isGroup` (optional): Set to true if sending to groups (default: false)
- `isNewsletter` (optional): Set to true for newsletter contacts (default: false)
- `isLid` (optional): Set to true for LID contacts (default: false)
- `options` (optional): Additional options like quotedMsg for replies

#### Response:

```json
{
  "status": "completed",
  "message": "Bulk message sent to 3 contacts",
  "summary": {
    "total": 3,
    "success": 2,
    "errors": 1
  },
  "results": [
    {
      "phone": "5521999999999",
      "status": "success",
      "result": {
        /* WhatsApp response */
      }
    },
    {
      "phone": "5521888888888",
      "status": "success",
      "result": {
        /* WhatsApp response */
      }
    }
  ],
  "errors": [
    {
      "phone": "5521777777777",
      "status": "error",
      "error": "Number does not exist"
    }
  ]
}
```

### 3. Bulk File Sending

**Endpoint:** `POST /api/{session}/send-bulk-file`

Send files (images, documents, etc.) to multiple contacts.

#### Request Body:

```json
{
  "phones": ["5521999999999", "5521888888888"],
  "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "filename": "document.pdf",
  "caption": "Important document for everyone",
  "delay": 3000
}
```

#### Parameters:

- `phones` (required): Array of phone numbers
- `base64` (required): Base64 encoded file content
- `filename` (optional): Name of the file
- `caption` (optional): Caption for the file
- `delay` (optional): Delay between sends (default: 1000ms)

## Phone Number Formats

The system automatically handles phone number formatting:

### Individual Contacts:

- `5521999999999` → `5521999999999@c.us`
- `+5521999999999` → `5521999999999@c.us`

### Groups:

- `120363043968123456` → `120363043968123456@g.us`

### Input Formats Supported:

- Array: `["5521999999999", "5521888888888"]`
- String with separators: `"5521999999999,5521888888888"` or `"5521999999999;5521888888888"`

## Best Practices

### 1. Use Delays

Always include delays between messages to avoid being blocked by WhatsApp:

```json
{
  "delay": 2000 // 2 seconds between messages
}
```

### 2. Handle Errors Gracefully

The bulk APIs return detailed error information for each contact:

- Check the `summary` for overall statistics
- Review `errors` array for failed sends
- Retry failed sends if needed

### 3. Batch Size Recommendations

- **Small batches**: 10-20 contacts per request
- **Medium batches**: 50-100 contacts (with longer delays)
- **Large batches**: Consider splitting into multiple requests

### 4. Monitor Rate Limits

WhatsApp has rate limits. If you encounter issues:

- Increase delay between messages
- Reduce batch sizes
- Implement exponential backoff for retries

## Authentication

All bulk messaging endpoints require authentication:

```bash
curl -X POST \
  'http://localhost:21465/api/YOUR_SESSION/send-bulk-message' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "phones": ["5521999999999", "5521888888888"],
    "message": "Hello everyone!"
  }'
```

## Error Handling

Common errors and solutions:

### "phones must be a non-empty array"

- Ensure `phones` is an array with at least one phone number

### "Number does not exist"

- The phone number is not registered on WhatsApp
- Check number format and country code

### "Session not active"

- Ensure your WhatsApp session is connected
- Check session status with `/api/{session}/check-connection-session`

## WebSocket Events

The server emits real-time events for bulk operations:

```javascript
socket.on('bulk-message-sent', (data) => {
  console.log('Bulk operation completed:', data);
  // data contains: total, success, errors, results
});
```

## Examples

### Send promotional message to customer list:

```bash
curl -X POST \
  'http://localhost:21465/api/mysession/send-bulk-message' \
  -H 'Authorization: Bearer mytoken' \
  -H 'Content-Type: application/json' \
  -d '{
    "phones": ["5521111111111", "5521222222222", "5521333333333"],
    "message": "🎉 Special offer! 50% off all products today only!",
    "delay": 3000
  }'
```

### Send document to team members:

```bash
curl -X POST \
  'http://localhost:21465/api/mysession/send-bulk-file' \
  -H 'Authorization: Bearer mytoken' \
  -H 'Content-Type: application/json' \
  -d '{
    "phones": ["5521111111111", "5521222222222"],
    "base64": "JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo...",
    "filename": "monthly_report.pdf",
    "caption": "Monthly report - please review",
    "delay": 2000
  }'
```

This completes the bulk messaging implementation for your WPPConnect server!
