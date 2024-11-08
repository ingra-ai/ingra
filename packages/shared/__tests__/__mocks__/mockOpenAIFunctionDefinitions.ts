export const mockOpenAIFunctionDefinitions = [
  {
    "name": "cloneFunction",
    "description": "Clone a function by providing referenced function ID.",
    "parameters": {
      "type": "object",
      "properties": {
        "functionId": {
          "type": "string",
          "format": "uuid",
          "description": "The ID of the function to clone. In UUID format.",
          "example": "090abc6e-0e19-466d-8549-83dd24c5c8e5"
        }
      },
      "required": []
    }
  },
  {
    "name": "createNewFunction",
    "description": "Create a new function for the current user by providing a function schema.",
    "parameters": {
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
              }
            },
            "tags": {
              "type": "array",
              "items": {
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
              }
            }
          }
        }
      },
      "required": []
    }
  },
  {
    "name": "dryRunFunction",
    "description": "Dry run a function by providing referenced function ID and \"body\" for the arguments.",
    "parameters": {
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
      },
      "required": []
    }
  },
  {
    "name": "editFunction",
    "description": "Edits or updates one or more fields on an existing function after knowing the function ID.",
    "parameters": {
      "type": "object",
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
              }
            },
            "tags": {
              "type": "array",
              "items": {
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
              }
            }
          }
        }
      },
      "required": []
    }
  },
  {
    "name": "searchFunctions",
    "description": "Search functions for id, slug, description, arguments and tags references. The returned records would be from user's own functions and subscribed functions.",
    "parameters": {
      "type": "object",
      "properties": {
        "q": {
          "type": "string",
          "description": "Query string to search functions by slug, description, or tags."
        },
        "fieldsToRetrieve": {
          "type": "array",
          "description": "Specifies which fields to retrieve. If left empty, all fields will be returned. ID and Slug will always be selected.",
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
      },
      "required": []
    }
  },
  {
    "name": "viewFunction",
    "description": "View a specific function details including by providing id or slug. Function code is visible in the response.",
    "parameters": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The ID of the function to view."
        },
        "slug": {
          "type": "string",
          "description": "The slug of the function to view."
        },
        "fieldsToRetrieve": {
          "type": "array",
          "description": "Specifies which fields to retrieve. If left empty, all fields will be returned. ID and Slug will always be selected.",
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
      },
      "required": []
    }
  }
]
