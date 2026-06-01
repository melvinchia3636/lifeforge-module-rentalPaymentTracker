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
            "id": {
              "type": "string"
            },
            "collectionId": {
              "type": "string"
            },
            "collectionName": {
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
            "amount_paid",
            "wallet_entry_id",
            "id",
            "collectionId",
            "collectionName"
          ],
          "additionalProperties": false
        }
      },
      "output": {
        "CREATED": {
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
            "meter_reading_image": {
              "type": "string"
            },
            "bank_statement": {
              "type": "string"
            },
            "amount_paid": {
              "type": "number"
            },
            "wallet_entry_id": {
              "type": "string"
            },
            "created": {
              "type": "string"
            },
            "updated": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "collectionId": {
              "type": "string"
            },
            "collectionName": {
              "type": "string"
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
            "meter_reading_image",
            "bank_statement",
            "amount_paid",
            "wallet_entry_id",
            "created",
            "updated",
            "id",
            "collectionId",
            "collectionName"
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
            "meter_reading_image": {
              "type": "string"
            },
            "bank_statement": {
              "type": "string"
            },
            "amount_paid": {
              "type": "number"
            },
            "wallet_entry_id": {
              "type": "string"
            },
            "created": {
              "type": "string"
            },
            "updated": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "collectionId": {
              "type": "string"
            },
            "collectionName": {
              "type": "string"
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
            "meter_reading_image",
            "bank_statement",
            "amount_paid",
            "wallet_entry_id",
            "created",
            "updated",
            "id",
            "collectionId",
            "collectionName"
          ],
          "additionalProperties": false
        },
        "NOT_FOUND": true
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
            "meter_reading_image": {
              "type": "string"
            },
            "bank_statement": {
              "type": "string"
            },
            "amount_paid": {
              "type": "number"
            },
            "wallet_entry_id": {
              "type": "string"
            },
            "created": {
              "type": "string"
            },
            "updated": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "collectionId": {
              "type": "string"
            },
            "collectionName": {
              "type": "string"
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
            "meter_reading_image",
            "bank_statement",
            "amount_paid",
            "wallet_entry_id",
            "created",
            "updated",
            "id",
            "collectionId",
            "collectionName"
          ],
          "additionalProperties": false
        },
        "CONFLICT": true,
        "BAD_REQUEST": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "string"
        },
        "NOT_FOUND": true
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
              "meter_reading_image": {
                "type": "string"
              },
              "bank_statement": {
                "type": "string"
              },
              "amount_paid": {
                "type": "number"
              },
              "wallet_entry_id": {
                "type": "string"
              },
              "created": {
                "type": "string"
              },
              "updated": {
                "type": "string"
              },
              "id": {
                "type": "string"
              },
              "collectionId": {
                "type": "string"
              },
              "collectionName": {
                "type": "string"
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
              "meter_reading_image",
              "bank_statement",
              "amount_paid",
              "wallet_entry_id",
              "created",
              "updated",
              "id",
              "collectionId",
              "collectionName"
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
        "NO_CONTENT": true,
        "NOT_FOUND": true
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
            "meter_reading_image": {
              "type": "string"
            },
            "bank_statement": {
              "type": "string"
            },
            "amount_paid": {
              "type": "number"
            },
            "wallet_entry_id": {
              "type": "string"
            },
            "created": {
              "type": "string"
            },
            "updated": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "collectionId": {
              "type": "string"
            },
            "collectionName": {
              "type": "string"
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
            "meter_reading_image",
            "bank_statement",
            "amount_paid",
            "wallet_entry_id",
            "created",
            "updated",
            "id",
            "collectionId",
            "collectionName"
          ],
          "additionalProperties": false
        },
        "BAD_REQUEST": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "string"
        },
        "NOT_FOUND": true
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
            },
            "id": {
              "type": "string"
            },
            "collectionId": {
              "type": "string"
            },
            "collectionName": {
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
            "meter_reading_image": {
              "type": "string"
            },
            "bank_statement": {
              "type": "string"
            },
            "amount_paid": {
              "type": "number"
            },
            "wallet_entry_id": {
              "type": "string"
            },
            "created": {
              "type": "string"
            },
            "updated": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "collectionId": {
              "type": "string"
            },
            "collectionName": {
              "type": "string"
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
            "meter_reading_image",
            "bank_statement",
            "amount_paid",
            "wallet_entry_id",
            "created",
            "updated",
            "id",
            "collectionId",
            "collectionName"
          ],
          "additionalProperties": false
        },
        "NOT_FOUND": true
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
            "initial_prepayment": {
              "type": "number"
            },
            "initial_meter_reading": {
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
            "link_with_wallet": {
              "type": "boolean"
            },
            "wallet_template_id": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "collectionId": {
              "type": "string"
            },
            "collectionName": {
              "type": "string"
            }
          },
          "required": [
            "initial_prepayment",
            "initial_meter_reading",
            "electricity_rate",
            "utility_bill",
            "rental_fee",
            "link_with_wallet",
            "wallet_template_id",
            "id",
            "collectionId",
            "collectionName"
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
              "type": "number"
            },
            "initial_meter_reading": {
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
            "link_with_wallet": {
              "type": "boolean"
            },
            "wallet_template_id": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "collectionId": {
              "type": "string"
            },
            "collectionName": {
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
            "initial_prepayment": {
              "type": "number"
            },
            "initial_meter_reading": {
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
            "link_with_wallet": {
              "type": "boolean"
            },
            "wallet_template_id": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "collectionId": {
              "type": "string"
            },
            "collectionName": {
              "type": "string"
            }
          },
          "required": [
            "initial_prepayment",
            "initial_meter_reading",
            "electricity_rate",
            "utility_bill",
            "rental_fee",
            "link_with_wallet",
            "wallet_template_id",
            "id",
            "collectionId",
            "collectionName"
          ],
          "additionalProperties": false
        }
      }
    }
  }
} as const

export default contract
