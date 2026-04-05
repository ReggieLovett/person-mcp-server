# Person MCP Server

MCP (Model Context Protocol) server for Claude Desktop to perform CRUD operations on the Person App database.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Claude Desktop

Edit your Claude Desktop config file:

**macOS/Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

Add this configuration:
```json
{
  "mcpServers": {
    "person-crud": {
      "command": "node",
      "args": ["/absolute/path/to/person-mcp-server/mcp-server.js"],
      "env": {
        "PERSON_APP_URL": "https://person-app-neon.vercel.app/api"
      }
    }
  }
}
```

Replace `/absolute/path/to/person-mcp-server` with your actual path. Get it with:
```bash
pwd
```

### 3. Restart Claude Desktop

Close and reopen Claude Desktop completely.

## Available Tools

Once configured, Claude can use these tools:

- **create_person** - Create a new person record
- **read_people** - Fetch all people or a specific person
- **update_person** - Update a person's information
- **delete_person** - Delete a person record
- **get_server_status** - Check MCP server connection

## Example Usage

In Claude Desktop, ask:
```
Create a person named John Smith, age 32, email john@example.com, position Senior Developer
```

Claude will automatically use the MCP tools to add them to your database!

## Environment Variables

- `PERSON_APP_URL` - Base URL of the Person App API (e.g., `https://person-app-neon.vercel.app/api`)

## Troubleshooting

**Tools not appearing in Claude:**
- Verify Node.js is installed: `node --version`
- Check the path in config.json is correct
- Restart Claude Desktop completely

**Connection errors:**
- Verify the Person App URL is correct
- Test the API: `curl https://person-app-neon.vercel.app/api/people`
- Check network connectivity

## Links

- [Person App](https://person-app-neon.vercel.app)
- [MCP Setup Guide](https://person-app-neon.vercel.app/mcp-setup)
- [MCP Demo](https://person-app-neon.vercel.app/mcp-demo)

---

Built with ❤️ using the Model Context Protocol
