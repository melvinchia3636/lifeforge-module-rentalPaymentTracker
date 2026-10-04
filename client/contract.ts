export const contract = {
  "entries": {
    "cleanupOrphanedWalletLinks": {
      "method": "post",
      "description": "Clean up rental payment entries that are linked to deleted wallet transactions",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {},
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "cleanedCount": {
              "type": "number"
            },
            "entries": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "cleanedCount",
            "entries"
          ],
          "additionalProperties": false
        }
      }
    },
    "create": {
      "method": "post",
      "description": "Create a new payment entry",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": {
        "meter_reading_image": {
          "optional": true
        },
        "bank_statement": {
          "optional": true
        }
      },
      "input": {
        "body": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "month": {
              "type": "number"
            },
            "year": {
              "type": "number"
            },
            "previous_meter_reading": {
              "type": "number"
            },
            "current_meter_reading": {
              "type": "number"
            },
            "electricity_used": {
              "type": "number"
            },
            "electricity_rate": {
              "type": "number"
            },
            "utility_bill": {
              "type": "number"
            },
            "rental_fee": {
              "type": "number"
            },
            "amount_paid": {
              "type": "number"
            },
            "wallet_entry_id": {
              "type": "string"
            },
            "auto_create_wallet_transaction": {
              "type": "boolean"
            }
          },
          "required": [
            "month",
            "year",
            "previous_meter_reading",
            "current_meter_reading",
            "electricity_used",
            "electricity_rate",
            "utility_bill",
            "rental_fee",
            "amount_paid"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "CREATED": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "month": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "year": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "previous_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "current_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_used": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_rate": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "utility_bill": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "rental_fee": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "meter_reading_image": {
              "type": "string"
            },
            "bank_statement": {
              "type": "string"
            },
            "amount_paid": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "wallet_entry_id": {
              "type": "string"
            },
            "created": {
              "type": "string",
              "format": "date-time"
            },
            "updated": {
              "type": "string",
              "format": "date-time"
            }
          },
          "required": [
            "id",
            "month",
            "year",
            "previous_meter_reading",
            "current_meter_reading",
            "electricity_used",
            "electricity_rate",
            "utility_bill",
            "rental_fee",
            "meter_reading_image",
            "bank_statement",
            "amount_paid",
            "wallet_entry_id",
            "created",
            "updated"
          ],
          "additionalProperties": false
        }
      }
    },
    "getById": {
      "method": "get",
      "description": "Get entry by ID",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "month": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "year": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "previous_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "current_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_used": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_rate": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "utility_bill": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "rental_fee": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "meter_reading_image": {
              "type": "string"
            },
            "bank_statement": {
              "type": "string"
            },
            "amount_paid": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "wallet_entry_id": {
              "type": "string"
            },
            "created": {
              "type": "string",
              "format": "date-time"
            },
            "updated": {
              "type": "string",
              "format": "date-time"
            }
          },
          "required": [
            "id",
            "month",
            "year",
            "previous_meter_reading",
            "current_meter_reading",
            "electricity_used",
            "electricity_rate",
            "utility_bill",
            "rental_fee",
            "meter_reading_image",
            "bank_statement",
            "amount_paid",
            "wallet_entry_id",
            "created",
            "updated"
          ],
          "additionalProperties": false
        }
      }
    },
    "linkWalletTransaction": {
      "method": "post",
      "description": "Link a wallet transaction to a rental payment entry",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "body": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "entryId": {
              "type": "string"
            },
            "transactionId": {
              "type": "string"
            }
          },
          "required": [
            "entryId",
            "transactionId"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "month": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "year": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "previous_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "current_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_used": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_rate": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "utility_bill": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "rental_fee": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "meter_reading_image": {
              "type": "string"
            },
            "bank_statement": {
              "type": "string"
            },
            "amount_paid": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "wallet_entry_id": {
              "type": "string"
            },
            "created": {
              "type": "string",
              "format": "date-time"
            },
            "updated": {
              "type": "string",
              "format": "date-time"
            }
          },
          "required": [
            "id",
            "month",
            "year",
            "previous_meter_reading",
            "current_meter_reading",
            "electricity_used",
            "electricity_rate",
            "utility_bill",
            "rental_fee",
            "meter_reading_image",
            "bank_statement",
            "amount_paid",
            "wallet_entry_id",
            "created",
            "updated"
          ],
          "additionalProperties": false
        }
      }
    },
    "list": {
      "method": "get",
      "description": "List all payment entries",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {},
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "format": "uuid",
                "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
              },
              "month": {
                "type": "integer",
                "minimum": -2147483648,
                "maximum": 2147483647
              },
              "year": {
                "type": "integer",
                "minimum": -2147483648,
                "maximum": 2147483647
              },
              "previous_meter_reading": {
                "type": "number",
                "minimum": -140737488355328,
                "maximum": 140737488355327
              },
              "current_meter_reading": {
                "type": "number",
                "minimum": -140737488355328,
                "maximum": 140737488355327
              },
              "electricity_used": {
                "type": "number",
                "minimum": -140737488355328,
                "maximum": 140737488355327
              },
              "electricity_rate": {
                "type": "number",
                "minimum": -140737488355328,
                "maximum": 140737488355327
              },
              "utility_bill": {
                "type": "number",
                "minimum": -140737488355328,
                "maximum": 140737488355327
              },
              "rental_fee": {
                "type": "number",
                "minimum": -140737488355328,
                "maximum": 140737488355327
              },
              "meter_reading_image": {
                "type": "string"
              },
              "bank_statement": {
                "type": "string"
              },
              "amount_paid": {
                "type": "number",
                "minimum": -140737488355328,
                "maximum": 140737488355327
              },
              "wallet_entry_id": {
                "type": "string"
              },
              "created": {
                "type": "string",
                "format": "date-time"
              },
              "updated": {
                "type": "string",
                "format": "date-time"
              }
            },
            "required": [
              "id",
              "month",
              "year",
              "previous_meter_reading",
              "current_meter_reading",
              "electricity_used",
              "electricity_rate",
              "utility_bill",
              "rental_fee",
              "meter_reading_image",
              "bank_statement",
              "amount_paid",
              "wallet_entry_id",
              "created",
              "updated"
            ],
            "additionalProperties": false
          }
        }
      }
    },
    "remove": {
      "method": "post",
      "description": "Delete an entry",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "NO_CONTENT": true
      }
    },
    "unlinkWalletTransaction": {
      "method": "post",
      "description": "Unlink a wallet transaction from a rental payment entry",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "body": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "entryId": {
              "type": "string"
            }
          },
          "required": [
            "entryId"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "month": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "year": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "previous_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "current_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_used": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_rate": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "utility_bill": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "rental_fee": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "meter_reading_image": {
              "type": "string"
            },
            "bank_statement": {
              "type": "string"
            },
            "amount_paid": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "wallet_entry_id": {
              "type": "string"
            },
            "created": {
              "type": "string",
              "format": "date-time"
            },
            "updated": {
              "type": "string",
              "format": "date-time"
            }
          },
          "required": [
            "id",
            "month",
            "year",
            "previous_meter_reading",
            "current_meter_reading",
            "electricity_used",
            "electricity_rate",
            "utility_bill",
            "rental_fee",
            "meter_reading_image",
            "bank_statement",
            "amount_paid",
            "wallet_entry_id",
            "created",
            "updated"
          ],
          "additionalProperties": false
        }
      }
    },
    "update": {
      "method": "post",
      "description": "Update an existing entry",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": {
        "meter_reading_image": {
          "optional": true
        },
        "bank_statement": {
          "optional": true
        }
      },
      "input": {
        "query": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "additionalProperties": false
        },
        "body": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "month": {
              "type": "number"
            },
            "year": {
              "type": "number"
            },
            "previous_meter_reading": {
              "type": "number"
            },
            "current_meter_reading": {
              "type": "number"
            },
            "electricity_used": {
              "type": "number"
            },
            "electricity_rate": {
              "type": "number"
            },
            "utility_bill": {
              "type": "number"
            },
            "rental_fee": {
              "type": "number"
            },
            "amount_paid": {
              "type": "number"
            },
            "wallet_entry_id": {
              "type": "string"
            }
          },
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "month": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "year": {
              "type": "integer",
              "minimum": -2147483648,
              "maximum": 2147483647
            },
            "previous_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "current_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_used": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_rate": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "utility_bill": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "rental_fee": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "meter_reading_image": {
              "type": "string"
            },
            "bank_statement": {
              "type": "string"
            },
            "amount_paid": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "wallet_entry_id": {
              "type": "string"
            },
            "created": {
              "type": "string",
              "format": "date-time"
            },
            "updated": {
              "type": "string",
              "format": "date-time"
            }
          },
          "required": [
            "id",
            "month",
            "year",
            "previous_meter_reading",
            "current_meter_reading",
            "electricity_used",
            "electricity_rate",
            "utility_bill",
            "rental_fee",
            "meter_reading_image",
            "bank_statement",
            "amount_paid",
            "wallet_entry_id",
            "created",
            "updated"
          ],
          "additionalProperties": false
        }
      }
    }
  },
  "settings": {
    "get": {
      "method": "get",
      "description": "Get user settings",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {},
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "initial_prepayment": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "initial_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_rate": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "utility_bill": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "rental_fee": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "link_with_wallet": {
              "type": "boolean"
            },
            "wallet_template_id": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "initial_prepayment",
            "initial_meter_reading",
            "electricity_rate",
            "utility_bill",
            "rental_fee",
            "link_with_wallet",
            "wallet_template_id"
          ],
          "additionalProperties": false
        }
      }
    },
    "update": {
      "method": "post",
      "description": "Update user settings",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {
        "body": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "initial_prepayment": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "initial_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_rate": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "utility_bill": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "rental_fee": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "link_with_wallet": {
              "type": "boolean"
            },
            "wallet_template_id": {
              "type": "string"
            }
          },
          "additionalProperties": false
        }
      },
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "initial_prepayment": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "initial_meter_reading": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "electricity_rate": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "utility_bill": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "rental_fee": {
              "type": "number",
              "minimum": -140737488355328,
              "maximum": 140737488355327
            },
            "link_with_wallet": {
              "type": "boolean"
            },
            "wallet_template_id": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "initial_prepayment",
            "initial_meter_reading",
            "electricity_rate",
            "utility_bill",
            "rental_fee",
            "link_with_wallet",
            "wallet_template_id"
          ],
          "additionalProperties": false
        }
      }
    }
  },
  "wallet": {
    "getWalletTemplates": {
      "method": "get",
      "description": "Get the list of templates from the wallet module",
      "noAuth": false,
      "encrypted": true,
      "isDownloadable": false,
      "media": null,
      "input": {},
      "output": {
        "OK": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "type": {
                "type": "string",
                "const": "expenses"
              },
              "amount": {
                "type": "number"
              },
              "particulars": {
                "type": "string"
              },
              "asset": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "category": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string"
                  },
                  "name": {
                    "type": "string"
                  },
                  "icon": {
                    "type": "string"
                  },
                  "color": {
                    "type": "string"
                  }
                },
                "required": [
                  "id",
                  "name",
                  "icon",
                  "color"
                ],
                "additionalProperties": false
              },
              "ledgers": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "location_name": {
                "type": "string"
              },
              "location_coords": {
                "anyOf": [
                  {
                    "type": "object",
                    "properties": {
                      "lat": {
                        "type": "number"
                      },
                      "lon": {
                        "type": "number"
                      }
                    },
                    "required": [
                      "lat",
                      "lon"
                    ],
                    "additionalProperties": false
                  },
                  {
                    "type": "null"
                  }
                ]
              }
            },
            "required": [
              "id",
              "name",
              "type",
              "amount",
              "particulars",
              "asset",
              "category",
              "ledgers",
              "location_name",
              "location_coords"
            ],
            "additionalProperties": false
          }
        }
      }
    }
  }
} as const

export default contract
