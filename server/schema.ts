import z from 'zod'

const rentalPaymentTrackerSchemas = {
  entries: {
    schema: z.object({
      month: z.number(),
      year: z.number(),
      previous_meter_reading: z.number(),
      current_meter_reading: z.number(),
      electricity_used: z.number(),
      electricity_rate: z.number(),
      utility_bill: z.number(),
      rental_fee: z.number(),
      meter_reading_image: z.string(),
      bank_statement: z.string(),
      amount_paid: z.number(),
      created: z.string(),
      updated: z.string()
    }),
    raw: {
      id: 'pbc_1769806214',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'rental_payment_tracker__entries',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          hidden: false,
          id: 'number2394296326',
          max: null,
          min: null,
          name: 'month',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number3145888567',
          max: null,
          min: null,
          name: 'year',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number2307573910',
          max: null,
          min: null,
          name: 'previous_meter_reading',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number2427755035',
          max: null,
          min: null,
          name: 'current_meter_reading',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number3286209738',
          max: null,
          min: null,
          name: 'electricity_used',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number1702152427',
          max: null,
          min: null,
          name: 'electricity_rate',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number82493876',
          max: null,
          min: null,
          name: 'utility_bill',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number3213384553',
          max: null,
          min: null,
          name: 'rental_fee',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'file2819049208',
          maxSelect: 1,
          maxSize: 0,
          mimeTypes: [
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'image/gif',
            'image/webp'
          ],
          name: 'meter_reading_image',
          presentable: false,
          protected: false,
          required: false,
          system: false,
          thumbs: [],
          type: 'file'
        },
        {
          hidden: false,
          id: 'file3006662639',
          maxSelect: 1,
          maxSize: 0,
          mimeTypes: [
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'image/gif',
            'image/webp'
          ],
          name: 'bank_statement',
          presentable: false,
          protected: false,
          required: false,
          system: false,
          thumbs: [],
          type: 'file'
        },
        {
          hidden: false,
          id: 'number2484990468',
          max: null,
          min: null,
          name: 'amount_paid',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'autodate2990389176',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate'
        },
        {
          hidden: false,
          id: 'autodate3332085495',
          name: 'updated',
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate'
        }
      ],
      indexes: [],
      system: false
    }
  },
  settings: {
    schema: z.object({
      initial_prepayment: z.number(),
      initial_meter_reading: z.number(),
      electricity_rate: z.number(),
      utility_bill: z.number(),
      rental_fee: z.number()
    }),
    raw: {
      id: 'pbc_2081798340',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      name: 'rental_payment_tracker__settings',
      type: 'base',
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text'
        },
        {
          hidden: false,
          id: 'number1437297728',
          max: null,
          min: null,
          name: 'initial_prepayment',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number2766594637',
          max: null,
          min: null,
          name: 'initial_meter_reading',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number1702152427',
          max: null,
          min: null,
          name: 'electricity_rate',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number82493876',
          max: null,
          min: null,
          name: 'utility_bill',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        },
        {
          hidden: false,
          id: 'number3213384553',
          max: null,
          min: null,
          name: 'rental_fee',
          onlyInt: false,
          presentable: false,
          required: false,
          system: false,
          type: 'number'
        }
      ],
      indexes: [],
      system: false
    }
  }
}

export default rentalPaymentTrackerSchemas
