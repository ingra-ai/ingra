export const mockOpenApi = {
  "openapi": "3.1.0",
  "info": {
    "title": "Ingra Plugin API",
    "version": "0.2.0",
    "description": "Ingra Hubs helps you curate and manage functions or workflows to create your own personal assistant suite tailored to your needs. Our goal is to make these functions freely available for everyone, enabling a community-driven approach to personal assistant development."
  },
  "paths": {
    "/api/v1/me/bio": {
      "post": {
        "summary": "Store a new memory for the user.",
        "operationId": "storeMemory",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "text"
                ],
                "properties": {
                  "text": {
                    "type": "string",
                    "description": "The text content to store and embed."
                  },
                  "metadata": {
                    "type": "object",
                    "description": "Additional metadata for personalization.",
                    "additionalProperties": true,
                    "properties": {
                      "tags": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "description": "Tags for the memory."
                      },
                      "category": {
                        "type": "string",
                        "description": "Category of the memory."
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Memory stored successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Memory"
        ]
      },
      "get": {
        "summary": "Retrieve memories based on a query and optional filters.",
        "operationId": "retrieveMemory",
        "parameters": [
          {
            "in": "query",
            "name": "query",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The query text to search for similar memories."
          },
          {
            "in": "query",
            "name": "topK",
            "schema": {
              "type": "integer",
              "default": 5
            },
            "required": false,
            "description": "Number of top results to retrieve."
          },
          {
            "in": "query",
            "name": "startDate",
            "schema": {
              "type": "string"
            },
            "required": false,
            "description": "Start date for filtering memories. Can be a natural language date (e.g., 'last Monday', '2023-10-01').\nIf only startDate is provided, memories from this date onwards are retrieved.\n"
          },
          {
            "in": "query",
            "name": "endDate",
            "schema": {
              "type": "string"
            },
            "required": false,
            "description": "End date for filtering memories. Can be a natural language date (e.g., 'today', '2023-10-15').\nIf only endDate is provided, memories up to this date are retrieved.\n"
          },
          {
            "in": "query",
            "name": "dateField",
            "schema": {
              "type": "string",
              "enum": [
                "createdAt",
                "updatedAt",
                "both"
              ],
              "default": "createdAt"
            },
            "required": false,
            "description": "Date field to filter on."
          },
          {
            "in": "query",
            "name": "operator",
            "schema": {
              "type": "string",
              "enum": [
                "AND",
                "OR"
              ],
              "default": "AND"
            },
            "required": false,
            "description": "Logical operator to combine date filters."
          }
        ],
        "responses": {
          "200": {
            "description": "Memories retrieved successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Memory"
        ]
      },
      "put": {
        "summary": "Update an existing memory.",
        "operationId": "updateMemory",
        "parameters": [
          {
            "in": "query",
            "name": "memoryId",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the memory to update."
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "text"
                ],
                "properties": {
                  "text": {
                    "type": "string",
                    "description": "The updated text content for the memory."
                  },
                  "metadata": {
                    "type": "object",
                    "description": "Updated metadata for personalization.",
                    "additionalProperties": true,
                    "properties": {
                      "tags": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "description": "Tags for the memory."
                      },
                      "category": {
                        "type": "string",
                        "description": "Category of the memory."
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Memory updated successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Memory"
        ]
      },
      "delete": {
        "summary": "Delete a memory by ID.",
        "operationId": "deleteMemory",
        "parameters": [
          {
            "in": "query",
            "name": "memoryId",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the memory to delete."
          }
        ],
        "responses": {
          "200": {
            "description": "Memory deleted successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Memory"
        ]
      }
    },
    "/api/v1/me/curateFunctions/clone": {
      "post": {
        "summary": "Generate an exact copy of a function and its arguments by providing referenced function ID. Useful for fast-prototyping of a new function using an existing similar one.",
        "operationId": "cloneFunction",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "functionId": {
                    "type": "string",
                    "format": "uuid",
                    "description": "The ID of the function to clone. In UUID format.",
                    "examples": [
                      "090abc6e-0e19-466d-8549-83dd24c5c8e5"
                    ]
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successfully cloned the function",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          },
          "404": {
            "description": "Function not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Curate Functions"
        ]
      }
    },
    "/api/v1/me/curateFunctions/createNew": {
      "post": {
        "summary": "Create a new function for the current user by providing a function schema.",
        "operationId": "createNewFunction",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "function": {
                    "type": "object",
                    "required": [
                      "slug",
                      "description"
                    ],
                    "properties": {
                      "slug": {
                        "type": "string",
                        "description": "The slug of the function to be edited"
                      },
                      "code": {
                        "type": "string",
                        "description": "The code of the function"
                      },
                      "description": {
                        "type": "string",
                        "description": "The description of the function"
                      },
                      "httpVerb": {
                        "type": "string",
                        "description": "The HTTP verb of the function"
                      },
                      "isPrivate": {
                        "type": "boolean",
                        "description": "If the function is private"
                      },
                      "isPublished": {
                        "type": "boolean",
                        "description": "If the function is published"
                      },
                      "arguments": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/FunctionArgument"
                        }
                      },
                      "tags": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/FunctionTag"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successfully created new function",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Curate Functions"
        ]
      }
    },
    "/api/v1/me/curateFunctions/dryRun": {
      "post": {
        "summary": "Dry run the code without arguments and returns the result. Expecting hard-coded values in replacement for the arguments. User variables and environment variables are still available in the VM context.",
        "operationId": "dryRunFunction",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "code"
                ],
                "properties": {
                  "code": {
                    "type": "string",
                    "description": "The sandbox code that follows the guideline to be executed."
                  },
                  "requestArgs": {
                    "type": "object",
                    "description": "The request arguments to pass to the function in a form of an object. This will be part of requestArgs in the VM context."
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successfully created new function",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Curate Functions"
        ]
      }
    },
    "/api/v1/me/curateFunctions/edit": {
      "patch": {
        "summary": "Edits or updates one or more fields on an existing function after knowing the function ID.",
        "operationId": "editFunction",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "description": "Any of the function fields that can be edited, including arguments and tags. ID is required.",
                "properties": {
                  "function": {
                    "type": "object",
                    "required": [
                      "id"
                    ],
                    "properties": {
                      "id": {
                        "type": "string",
                        "description": "The ID of the function to be edited"
                      },
                      "slug": {
                        "type": "string",
                        "description": "The slug of the function to be edited"
                      },
                      "code": {
                        "type": "string",
                        "description": "The code of the function"
                      },
                      "description": {
                        "type": "string",
                        "description": "The description of the function"
                      },
                      "httpVerb": {
                        "type": "string",
                        "description": "The HTTP verb of the function"
                      },
                      "isPrivate": {
                        "type": "boolean",
                        "description": "If the function is private"
                      },
                      "isPublished": {
                        "type": "boolean",
                        "description": "If the function is published"
                      },
                      "arguments": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/FunctionArgument"
                        }
                      },
                      "tags": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/FunctionTag"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successfully edited existing function",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Curate Functions"
        ]
      }
    },
    "/api/v1/me/curateFunctions/executeFunction": {
      "post": {
        "summary": "Dry run a function by providing referenced function ID and \"requestArgs\" for the function's arguments.",
        "operationId": "executeFunction",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "functionIdOrSlug"
                ],
                "properties": {
                  "functionIdOrSlug": {
                    "type": "string",
                    "description": "The ID in UUID format, or slug of the function to run.",
                    "examples": [
                      "090abc6e-0e19-466d-8549-83dd24c5c8e5",
                      "myFunction"
                    ]
                  },
                  "requestArgs": {
                    "type": "object",
                    "description": "The request arguments to pass to the function in a form of an object. This will be part of requestArgs in the VM context.",
                    "properties": {},
                    "additionalProperties": true
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successfully ran the function",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          },
          "404": {
            "description": "Function not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Curate Functions"
        ]
      }
    },
    "/api/v1/me/curateFunctions/getCodeTemplate": {
      "get": {
        "summary": "Getting the code template for current user. It will show what are the available user vars, environment vars, and VM globals in the comment that are ready to be utilized when generating code.",
        "operationId": "getCodeTemplate",
        "responses": {
          "200": {
            "description": "Successfully retrieved the function",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          },
          "404": {
            "description": "Function not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal"
        ]
      }
    },
    "/api/v1/me/curateFunctions/search": {
      "get": {
        "summary": "Search functions for id, slug, description, arguments and tags references. The returned records would be from user's own functions and subscribed functions.",
        "operationId": "searchFunctions",
        "parameters": [
          {
            "in": "query",
            "name": "q",
            "schema": {
              "type": "string"
            },
            "description": "Query string to search functions by slug, description, or tags."
          },
          {
            "in": "query",
            "name": "fieldsToRetrieve",
            "schema": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "description",
                  "code",
                  "httpVerb",
                  "isPrivate",
                  "isPublished",
                  "arguments",
                  "tags"
                ]
              }
            },
            "description": "Specifies which fields to retrieve. If left empty, all fields will be returned. ID and Slug will always be selected. Only return `code` when requested since the payload is large."
          },
          {
            "in": "query",
            "name": "take",
            "schema": {
              "type": "integer"
            },
            "description": "Number of records to retrieve. Default is 50."
          },
          {
            "in": "query",
            "name": "skip",
            "schema": {
              "type": "integer"
            },
            "description": "Number of records to skip. Default is 0."
          }
        ],
        "responses": {
          "200": {
            "description": "Successfully retrieved list of searched functions",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Curate Functions"
        ]
      }
    },
    "/api/v1/me/curateFunctions/view": {
      "get": {
        "summary": "View a specific function details including by providing id or slug. Function code is visible in the response.",
        "operationId": "viewFunction",
        "parameters": [
          {
            "in": "query",
            "name": "functionIdOrSlug",
            "description": "The ID in UUID format, or slug of the function to view.",
            "schema": {
              "type": "string",
              "examples": [
                "090abc6e-0e19-466d-8549-83dd24c5c8e5",
                "myFunction"
              ]
            }
          },
          {
            "in": "query",
            "name": "fieldsToRetrieve",
            "description": "Specifies which fields to retrieve. If left empty, all fields will be returned. ID and Slug will always be selected.",
            "schema": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "description",
                  "code",
                  "httpVerb",
                  "isPrivate",
                  "isPublished",
                  "arguments",
                  "tags"
                ]
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successfully retrieved the function",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiSuccess"
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          },
          "404": {
            "description": "Function not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiError"
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal"
        ]
      }
    },
    "/api/v1/me/environmentVariables": {
      "get": {
        "summary": "Retrieve all available environment variable keys and their record IDs.",
        "operationId": "getEnvironmentVariablesList",
        "responses": {
          "200": {
            "description": "Successfully retrieved environment variables.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "examples": [
                        "success"
                      ]
                    },
                    "message": {
                      "type": "string",
                      "examples": [
                        "Discovered 5 environment variables set."
                      ]
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "key": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Environment Variables"
        ]
      },
      "post": {
        "summary": "Create a new environment variable.",
        "operationId": "createEnvironmentVariable",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "key": {
                    "type": "string",
                    "examples": [
                      "DATABASE_URL"
                    ]
                  },
                  "value": {
                    "type": "string",
                    "examples": [
                      "postgres://user:password@localhost:5432/dbname"
                    ]
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Environment variable created successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "examples": [
                        "success"
                      ]
                    },
                    "message": {
                      "type": "string",
                      "examples": [
                        "Environment variable \"DATABASE_URL\" created successfully."
                      ]
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string"
                        },
                        "key": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Environment Variables"
        ]
      },
      "delete": {
        "summary": "Delete an environment variable.",
        "operationId": "deleteEnvironmentVariable",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string"
                  },
                  "key": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Environment variable removed successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "examples": [
                        "success"
                      ]
                    },
                    "message": {
                      "type": "string",
                      "examples": [
                        "Environment variable \"DATABASE_URL\" removed successfully."
                      ]
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string"
                        },
                        "key": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Environment Variables"
        ]
      },
      "patch": {
        "summary": "Update an environment variable.",
        "operationId": "updateEnvironmentVariable",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string"
                  },
                  "key": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Environment variable updated successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "examples": [
                        "success"
                      ]
                    },
                    "message": {
                      "type": "string",
                      "examples": [
                        "Environment variable \"DATABASE_URL\" updated successfully."
                      ]
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string"
                        },
                        "key": {
                          "type": "string"
                        },
                        "value": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "Environment Variables"
        ]
      }
    },
    "/api/v1/me/oAuthTokens": {
      "get": {
        "summary": "Retrieve all available OAuth tokens for the authenticated user.",
        "operationId": "getOAuthTokensList",
        "responses": {
          "200": {
            "description": "Successfully retrieved OAuth tokens.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "examples": [
                        "success"
                      ]
                    },
                    "message": {
                      "type": "string",
                      "examples": [
                        "Discovered 3 oAuth tokens set."
                      ]
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "examples": [
                              "123e4567-e89b-12d3-a456-426614174000"
                            ]
                          },
                          "service": {
                            "type": "string",
                            "examples": [
                              "google-oauth"
                            ]
                          },
                          "primaryEmailAddress": {
                            "type": "string",
                            "examples": [
                              "user@example.com"
                            ]
                          },
                          "isDefault": {
                            "type": "boolean",
                            "examples": [
                              true
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "OAuth Token"
        ]
      },
      "patch": {
        "summary": "Set an OAuth token as the default for a specific service.",
        "operationId": "setOAuthTokenAsDefault",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "examples": [
                      "123e4567-e89b-12d3-a456-426614174000"
                    ]
                  },
                  "service": {
                    "type": "string",
                    "examples": [
                      "google-oauth"
                    ]
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OAuth token set as default successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "examples": [
                        "success"
                      ]
                    },
                    "message": {
                      "type": "string",
                      "examples": [
                        "Sets default OAuth token for service \"google\" to user@example.com."
                      ]
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "examples": [
                            "123e4567-e89b-12d3-a456-426614174000"
                          ]
                        },
                        "service": {
                          "type": "string",
                          "examples": [
                            "google-oauth"
                          ]
                        },
                        "primaryEmailAddress": {
                          "type": "string",
                          "examples": [
                            "user@example.com"
                          ]
                        },
                        "isDefault": {
                          "type": "boolean",
                          "examples": [
                            true
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "tags": [
          "Built-ins Internal",
          "OAuth Token"
        ]
      }
    }
  },
  "components": {
    "schemas": {
      "ApiError": {
        "type": "object",
        "required": [
          "message"
        ],
        "properties": {
          "status": {
            "type": "integer",
            "format": "int32",
            "description": "An optional error code representing the error type. For example, 400 for Bad Request, 401 for Unauthorized, 403 for Forbidden, 404 for Not Found, 500 for Internal Server Error."
          },
          "code": {
            "type": "string",
            "nullable": true,
            "description": "A brief description of the error message."
          },
          "message": {
            "type": "string",
            "description": "A detailed message describing the error message."
          }
        }
      },
      "ApiSuccess": {
        "type": "object",
        "required": [
          "status",
          "message"
        ],
        "properties": {
          "status": {
            "type": "string",
            "description": "A brief description of the successful operation.",
            "examples": [
              "OK"
            ]
          },
          "message": {
            "type": "string",
            "description": "A brief message of the successful operation.",
            "examples": [
              "Operation successful."
            ]
          },
          "data": {
            "oneOf": [
              {
                "type": "object",
                "additionalProperties": true,
                "description": "An arbitrary object returned by the operation."
              },
              {
                "type": "array",
                "items": {
                  "type": "object",
                  "additionalProperties": true
                },
                "description": "An array of arbitrary objects returned by the operation."
              }
            ]
          }
        }
      },
      "FunctionArgument": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "default": "",
            "description": "Unique identifier for the function argument."
          },
          "name": {
            "type": "string",
            "default": "",
            "description": "The name of the argument."
          },
          "type": {
            "type": "string",
            "enum": [
              "string",
              "number",
              "boolean"
            ],
            "default": "string",
            "description": "The data type of the argument (e.g., string, number, boolean)."
          },
          "defaultValue": {
            "type": "string",
            "nullable": true,
            "default": "",
            "description": "The default value of the argument."
          },
          "description": {
            "type": "string",
            "nullable": true,
            "default": "",
            "description": "A description of the argument."
          },
          "isRequired": {
            "type": "boolean",
            "default": false,
            "description": "Indicates if the argument is required."
          }
        }
      },
      "FunctionTag": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "default": "",
            "description": "Unique identifier for the function tag."
          },
          "functionId": {
            "type": "string",
            "format": "uuid",
            "default": "",
            "description": "The ID of the function this tag belongs to."
          },
          "name": {
            "type": "string",
            "default": "",
            "description": "The name of the tag."
          }
        }
      },
      "Function": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "default": "",
            "description": "Unique identifier for the function."
          },
          "slug": {
            "type": "string",
            "default": "",
            "description": "A unique slug for the function."
          },
          "code": {
            "type": "string",
            "default": "",
            "description": "The code for the function."
          },
          "isPrivate": {
            "type": "boolean",
            "default": true,
            "description": "Indicates if the function is private."
          },
          "isPublished": {
            "type": "boolean",
            "default": false,
            "description": "Indicates if the function is published."
          },
          "httpVerb": {
            "type": "string",
            "enum": [
              "GET",
              "POST",
              "PUT",
              "PATCH",
              "DELETE"
            ],
            "default": "GET",
            "description": "The HTTP verb used by the function."
          },
          "description": {
            "type": "string",
            "default": "",
            "description": "A description of the function."
          },
          "arguments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/FunctionArgument"
            },
            "description": "A list of arguments for the function."
          },
          "tags": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/FunctionTag"
            },
            "description": "A list of tags associated with the function."
          }
        }
      }
    }
  },
  "security": [],
  "tags": [],
  "servers": [
    {
      "url": "http://localhost:3000"
    }
  ]
}