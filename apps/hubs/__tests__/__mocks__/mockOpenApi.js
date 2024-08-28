export const mockOpenApi = {
  "openapi": "3.1.0",
  "info": {
    "title": "Ingra Plugin API",
    "version": "0.2.0",
    "description": "Ingra Portal helps you curate and manage functions or workflows to create your own personal assistant suite tailored to your needs. Our goal is to make these functions freely available for everyone, enabling a community-driven approach to personal assistant development."
  },
  "paths": {
    "/api/v1/me/curateFunctions/clone": {
      "post": {
        "summary": "Clone a function by providing referenced function ID.",
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
                    "example": "090abc6e-0e19-466d-8549-83dd24c5c8e5"
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
          "Built-ins Internal"
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
          "Built-ins Internal"
        ]
      }
    },
    "/api/v1/me/curateFunctions/dryRun": {
      "post": {
        "summary": "Dry run a function by providing referenced function ID and \"body\" for the arguments.",
        "operationId": "dryRunFunction",
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
                    "description": "The ID of the function to run. In UUID format.",
                    "example": "090abc6e-0e19-466d-8549-83dd24c5c8e5"
                  },
                  "body": {
                    "type": "object",
                    "description": "The arguments to pass to the function.",
                    "additionalProperties": {
                      "type": "object"
                    }
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
          "Built-ins Internal"
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
            "description": "Specifies which fields to retrieve. If left empty, all fields will be returned. ID and Slug will always be selected."
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
          "Built-ins Internal"
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
            "name": "id",
            "schema": {
              "type": "string",
              "format": "uuid"
            },
            "description": "The ID of the function to view."
          },
          {
            "in": "query",
            "name": "slug",
            "schema": {
              "type": "string"
            },
            "description": "The slug of the function to view."
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
            "description": "Specifies which fields to retrieve. If left empty, all fields will be returned. ID and Slug will always be selected."
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
            "example": "OK"
          },
          "message": {
            "type": "string",
            "description": "A brief message of the successful operation.",
            "example": "Operation successful."
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
};