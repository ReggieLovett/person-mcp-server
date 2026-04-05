#!/usr/bin/env node

/**
 * Person CRUD MCP Server
 * 
 * This is the actual MCP server that Claude Desktop connects to.
 * It exposes tools for creating, reading, updating, and deleting Person records.
 * 
 * The server communicates over stdio with Claude Desktop.
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio");
const {
  CallToolRequestSchema,
  TextContent,
  Tool,
} = require("@modelcontextprotocol/sdk/types");

// Import database client
const axios = require("axios");

// Configuration
const API_BASE_URL = process.env.PERSON_APP_URL || "http://localhost:3000/api";

// Create MCP Server instance
const server = new Server(
  {
    name: "person-crud-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools = [
  {
    name: "create_person",
    description:
      "Create a new person record with their information. Returns the created person object with ID.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Full name of the person (required)",
        },
        age: {
          type: "number",
          description: "Age of the person (required)",
        },
        email: {
          type: "string",
          description: "Email address (required, must be unique)",
        },
        phone: {
          type: "string",
          description: "Phone number (optional)",
        },
        position: {
          type: "string",
          description: "Job position or title (optional)",
        },
        department: {
          type: "string",
          description: "Department name (optional)",
        },
        bio: {
          type: "string",
          description: "Biography or description (optional)",
        },
      },
      required: ["name", "age", "email"],
    },
  },
  {
    name: "read_people",
    description:
      "Fetch all people or get details about a specific person by ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description:
            "Optional person ID. If provided, returns only that person. If omitted, returns all people.",
        },
      },
    },
  },
  {
    name: "update_person",
    description:
      "Update a person's information. Provide the person ID and the fields to update.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "Person ID (required)",
        },
        name: {
          type: "string",
          description: "Updated name (optional)",
        },
        age: {
          type: "number",
          description: "Updated age (optional)",
        },
        email: {
          type: "string",
          description: "Updated email (optional)",
        },
        phone: {
          type: "string",
          description: "Updated phone (optional)",
        },
        position: {
          type: "string",
          description: "Updated position (optional)",
        },
        department: {
          type: "string",
          description: "Updated department (optional)",
        },
        bio: {
          type: "string",
          description: "Updated bio (optional)",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_person",
    description: "Delete a person record by their ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "Person ID to delete (required)",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "get_server_status",
    description:
      "Check the connection status and configuration of the MCP server.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "create_person": {
        const response = await axios.post(`${API_BASE_URL}/people`, {
          name: args.name,
          age: args.age,
          email: args.email,
          phone: args.phone || null,
          position: args.position || null,
          department: args.department || null,
          bio: args.bio || null,
        });
        return {
          content: [
            {
              type: "text",
              text: `✅ Person created successfully:\n${JSON.stringify(
                response.data,
                null,
                2
              )}`,
            },
          ],
        };
      }

      case "read_people": {
        if (args.id) {
          const response = await axios.get(`${API_BASE_URL}/people/${args.id}`);
          return {
            content: [
              {
                type: "text",
                text: `📋 Person found:\n${JSON.stringify(
                  response.data,
                  null,
                  2
                )}`,
              },
            ],
          };
        } else {
          const response = await axios.get(`${API_BASE_URL}/people`);
          return {
            content: [
              {
                type: "text",
                text: `📋 All people (${response.data.length} total):\n${JSON.stringify(
                  response.data,
                  null,
                  2
                )}`,
              },
            ],
          };
        }
      }

      case "update_person": {
        const response = await axios.put(`${API_BASE_URL}/people/${args.id}`, {
          name: args.name,
          age: args.age,
          email: args.email,
          phone: args.phone,
          position: args.position,
          department: args.department,
          bio: args.bio,
        });
        return {
          content: [
            {
              type: "text",
              text: `✅ Person updated successfully:\n${JSON.stringify(
                response.data,
                null,
                2
              )}`,
            },
          ],
        };
      }

      case "delete_person": {
        await axios.delete(`${API_BASE_URL}/people/${args.id}`);
        return {
          content: [
            {
              type: "text",
              text: `✅ Person with ID ${args.id} deleted successfully`,
            },
          ],
        };
      }

      case "get_server_status": {
        return {
          content: [
            {
              type: "text",
              text: `✅ MCP Server Status:\n- Server: person-crud-server v1.0.0\n- API Base URL: ${API_BASE_URL}\n- Status: Connected and ready\n- Available tools: create_person, read_people, update_person, delete_person`,
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `❌ Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Export tools when requested
server.setRequestHandler({ type: "resources/list" }, async () => {
  return {
    resources: [],
  };
});

// List tools
server.setRequestHandler({ type: "tools/list" }, async () => {
  return {
    tools: tools,
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Person CRUD MCP Server started successfully");
}

main().catch(console.error);
