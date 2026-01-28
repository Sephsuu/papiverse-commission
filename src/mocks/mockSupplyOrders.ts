import { SupplyOrder } from "@/types/supplyOrder";

export const mockSupplyOrders: SupplyOrder[] = [
  {
    orderId: 1001,
    branchName: "Papiverse – Imus",
    orderDate: "2026-01-20",
    status: "PENDING",
    remarks: "For morning delivery",
    deliveryFee: 150,
    completeOrderTotalAmount: 4850,

    meatCategory: {
      meatOrderId: "MEAT-1001",
      isApproved: false,
      categoryTotal: 3200,
      meatItems: [
        {
          rawMaterialCode: "RM-CHK-001",
          rawMaterialName: "Chicken Breast",
          unitMeasurement: "kg",
          quantity: 10,
          price: 280,
        },
        {
          rawMaterialCode: "RM-PORK-001",
          rawMaterialName: "Pork Belly",
          unitMeasurement: "kg",
          quantity: 5,
          price: 360,
        },
      ],
    },

    snowfrostCategory: {
      snowFrostOrderId: "SNOW-1001",
      isApproved: false,
      categoryTotal: 1500,
      snowFrostItems: [
        {
          rawMaterialCode: "RM-ICE-001",
          rawMaterialName: "Crushed Ice",
          unitMeasurement: "bag",
          quantity: 20,
          price: 50,
        },
        {
          rawMaterialCode: "RM-SNOW-002",
          rawMaterialName: "Snow Frost Mix",
          unitMeasurement: "pack",
          quantity: 10,
          price: 50,
        },
      ],
    },
  },

  {
    orderId: 1002,
    branchName: "Papiverse – Dasmariñas",
    orderDate: "2026-01-21",
    status: "APPROVED",
    remarks: "Urgent order",
    deliveryFee: 200,
    completeOrderTotalAmount: 3600,

    meatCategory: {
      meatOrderId: "MEAT-1002",
      isApproved: true,
      categoryTotal: 3400,
      meatItems: [
        {
          rawMaterialCode: "RM-BEEF-001",
          rawMaterialName: "Beef Chuck",
          unitMeasurement: "kg",
          quantity: 8,
          price: 425,
        },
      ],
    },
  },

  {
    orderId: 1003,
    branchName: "Papiverse – Bacoor",
    orderDate: "2026-01-22",
    status: "APPROVED",
    remarks: "Delivered successfully",
    deliveryFee: 100,
    completeOrderTotalAmount: 2100,

    snowfrostCategory: {
      snowFrostOrderId: "SNOW-1003",
      isApproved: true,
      categoryTotal: 2000,
      snowFrostItems: [
        {
          rawMaterialCode: "RM-ICE-002",
          rawMaterialName: "Ice Cubes",
          unitMeasurement: "bag",
          quantity: 25,
          price: 40,
        },
        {
          rawMaterialCode: "RM-SYRUP-001",
          rawMaterialName: "Flavor Syrup",
          unitMeasurement: "bottle",
          quantity: 5,
          price: 100,
        },
      ],
    },
  },

  {
    orderId: 1004,
    branchName: "Papiverse – General Trias",
    orderDate: "2026-01-23",
    status: "REJECTED",
    remarks: "Insufficient stock",
    deliveryFee: 0,
    completeOrderTotalAmount: 300,

    meatCategory: {
      meatOrderId: "MEAT-1004",
      isApproved: false,
      categoryTotal: 1800,
      meatItems: [
        {
          rawMaterialCode: "RM-CHK-002",
          rawMaterialName: "Chicken Thigh",
          unitMeasurement: "kg",
          quantity: 6,
          price: 300,
        },
      ],
    },
  },

  {
    orderId: 1005,
    branchName: "Papiverse – Silang",
    orderDate: "2026-01-24",
    status: "PENDING",
    remarks: "Include delivery receipt",
    deliveryFee: 120,
    completeOrderTotalAmount: 5200,

    meatCategory: {
      meatOrderId: "MEAT-1005",
      isApproved: false,
      categoryTotal: 3700,
      meatItems: [
        {
          rawMaterialCode: "RM-PORK-002",
          rawMaterialName: "Ground Pork",
          unitMeasurement: "kg",
          quantity: 12,
          price: 250,
        },
        {
          rawMaterialCode: "RM-BEEF-002",
          rawMaterialName: "Ground Beef",
          unitMeasurement: "kg",
          quantity: 4,
          price: 350,
        },
      ],
    },

    snowfrostCategory: {
      snowFrostOrderId: "SNOW-1005",
      isApproved: false,
      categoryTotal: 1400,
      snowFrostItems: [
        {
          rawMaterialCode: "RM-ICE-003",
          rawMaterialName: "Block Ice",
          unitMeasurement: "block",
          quantity: 7,
          price: 100,
        },
      ],
    },
  },

  {
    orderId: 1006,
    branchName: "Papiverse – Bacoor",
    orderDate: "2026-01-21",
    status: "PENDING",
    remarks: "Urgent delivery",
    deliveryFee: 200,
    completeOrderTotalAmount: 6120,

    meatCategory: {
      meatOrderId: "MEAT-1002",
      isApproved: false,
      categoryTotal: 4200,
      meatItems: [
        {
          rawMaterialCode: "RM-BEEF-001",
          rawMaterialName: "Beef Chuck",
          unitMeasurement: "kg",
          quantity: 8,
          price: 520,
        },
        {
          rawMaterialCode: "RM-CHK-002",
          rawMaterialName: "Chicken Wings",
          unitMeasurement: "kg",
          quantity: 6,
          price: 300,
        },
      ],
    },

    snowfrostCategory: {
      snowFrostOrderId: "SNOW-1002",
      isApproved: false,
      categoryTotal: 1720,
      snowFrostItems: [
        {
          rawMaterialCode: "RM-ICE-001",
          rawMaterialName: "Crushed Ice",
          unitMeasurement: "bag",
          quantity: 24,
          price: 50,
        },
        {
          rawMaterialCode: "RM-SNOW-003",
          rawMaterialName: "Premium Snow Frost Mix",
          unitMeasurement: "pack",
          quantity: 8,
          price: 65,
        },
      ],
    },
  },

  {
    orderId: 1007,
    branchName: "Papiverse – Dasmariñas",
    orderDate: "2026-01-22",
    status: "APPROVED",
    remarks: "Deliver before noon",
    deliveryFee: 180,
    completeOrderTotalAmount: 5380,

    meatCategory: {
      meatOrderId: "MEAT-1003",
      isApproved: true,
      categoryTotal: 3600,
      meatItems: [
        {
          rawMaterialCode: "RM-PORK-002",
          rawMaterialName: "Pork Chop",
          unitMeasurement: "kg",
          quantity: 7,
          price: 380,
        },
        {
          rawMaterialCode: "RM-CHK-003",
          rawMaterialName: "Whole Chicken",
          unitMeasurement: "pc",
          quantity: 10,
          price: 220,
        },
      ],
    },

    snowfrostCategory: {
      snowFrostOrderId: "SNOW-1003",
      isApproved: true,
      categoryTotal: 1600,
      snowFrostItems: [
        {
          rawMaterialCode: "RM-ICE-002",
          rawMaterialName: "Ice Blocks",
          unitMeasurement: "block",
          quantity: 15,
          price: 80,
        },
        {
          rawMaterialCode: "RM-SNOW-002",
          rawMaterialName: "Snow Frost Mix",
          unitMeasurement: "pack",
          quantity: 10,
          price: 40,
        },
      ],
    },
  },

  {
    orderId: 1008,
    branchName: "Papiverse – Kawit",
    orderDate: "2026-01-23",
    status: "REJECTED",
    remarks: "Insufficient stock on meat items",
    deliveryFee: 150,
    completeOrderTotalAmount: 2980,

    meatCategory: {
      meatOrderId: "MEAT-1004",
      isApproved: false,
      categoryTotal: 1800,
      meatItems: [
        {
          rawMaterialCode: "RM-PORK-003",
          rawMaterialName: "Ground Pork",
          unitMeasurement: "kg",
          quantity: 5,
          price: 360,
        },
      ],
    },

    snowfrostCategory: {
      snowFrostOrderId: "SNOW-1004",
      isApproved: false,
      categoryTotal: 1030,
      snowFrostItems: [
        {
          rawMaterialCode: "RM-ICE-001",
          rawMaterialName: "Crushed Ice",
          unitMeasurement: "bag",
          quantity: 15,
          price: 50,
        },
        {
          rawMaterialCode: "RM-SNOW-004",
          rawMaterialName: "Flavor Syrup Base",
          unitMeasurement: "bottle",
          quantity: 4,
          price: 70,
        },
      ],
    },
  },

  {
    orderId: 1009,
    branchName: "Papiverse – Silang",
    orderDate: "2026-01-26",
    status: "PENDING",
    remarks: "Standard delivery",
    deliveryFee: 160,
    completeOrderTotalAmount: 4720,

    meatCategory: {
      meatOrderId: "MEAT-1009",
      isApproved: false,
      categoryTotal: 2950,
      meatItems: [
        {
          rawMaterialCode: "RM-CHK-001",
          rawMaterialName: "Chicken Breast",
          unitMeasurement: "kg",
          quantity: 9,
          price: 280,
        },
        {
          rawMaterialCode: "RM-PORK-004",
          rawMaterialName: "Pork Shoulder",
          unitMeasurement: "kg",
          quantity: 4,
          price: 360,
        },
      ],
    },

    snowfrostCategory: {
      snowFrostOrderId: "SNOW-1009",
      isApproved: false,
      categoryTotal: 1610,
      snowFrostItems: [
        {
          rawMaterialCode: "RM-ICE-001",
          rawMaterialName: "Crushed Ice",
          unitMeasurement: "bag",
          quantity: 22,
          price: 50,
        },
        {
          rawMaterialCode: "RM-SNOW-002",
          rawMaterialName: "Snow Frost Mix",
          unitMeasurement: "pack",
          quantity: 10,
          price: 51,
        },
      ],
    },
  },

  {
    orderId: 1010,
    branchName: "Papiverse – General Trias",
    orderDate: "2026-01-27",
    status: "APPROVED",
    remarks: "Approved for dispatch",
    deliveryFee: 180,
    completeOrderTotalAmount: 6540,

    meatCategory: {
      meatOrderId: "MEAT-1010",
      isApproved: true,
      categoryTotal: 4480,
      meatItems: [
        {
          rawMaterialCode: "RM-BEEF-002",
          rawMaterialName: "Beef Brisket",
          unitMeasurement: "kg",
          quantity: 6,
          price: 680,
        },
        {
          rawMaterialCode: "RM-CHK-002",
          rawMaterialName: "Chicken Wings",
          unitMeasurement: "kg",
          quantity: 7,
          price: 300,
        },
      ],
    },

    snowfrostCategory: {
      snowFrostOrderId: "SNOW-1010",
      isApproved: true,
      categoryTotal: 1880,
      snowFrostItems: [
        {
          rawMaterialCode: "RM-ICE-002",
          rawMaterialName: "Ice Blocks",
          unitMeasurement: "block",
          quantity: 18,
          price: 80,
        },
        {
          rawMaterialCode: "RM-SNOW-003",
          rawMaterialName: "Premium Snow Frost Mix",
          unitMeasurement: "pack",
          quantity: 8,
          price: 55,
        },
      ],
    },
  },

  {
    orderId: 1011,
    branchName: "Papiverse – Trece Martires",
    orderDate: "2026-01-28",
    status: "PENDING",
    remarks: "Awaiting supplier confirmation",
    deliveryFee: 170,
    completeOrderTotalAmount: 5210,

    meatCategory: {
      meatOrderId: "MEAT-1011",
      isApproved: false,
      categoryTotal: 3320,
      meatItems: [
        {
          rawMaterialCode: "RM-PORK-001",
          rawMaterialName: "Pork Belly",
          unitMeasurement: "kg",
          quantity: 6,
          price: 360,
        },
        {
          rawMaterialCode: "RM-CHK-004",
          rawMaterialName: "Chicken Thigh Fillet",
          unitMeasurement: "kg",
          quantity: 5,
          price: 280,
        },
      ],
    },

    snowfrostCategory: {
      snowFrostOrderId: "SNOW-1011",
      isApproved: false,
      categoryTotal: 1720,
      snowFrostItems: [
        {
          rawMaterialCode: "RM-ICE-001",
          rawMaterialName: "Crushed Ice",
          unitMeasurement: "bag",
          quantity: 20,
          price: 50,
        },
        {
          rawMaterialCode: "RM-SNOW-005",
          rawMaterialName: "Snow Frost Flavor Concentrate",
          unitMeasurement: "bottle",
          quantity: 6,
          price: 70,
        },
      ],
    },
  },

  {
    orderId: 1012,
    branchName: "Papiverse – Naic",
    orderDate: "2026-01-29",
    status: "APPROVED",
    remarks: "Partial approval, proceed with delivery",
    deliveryFee: 150,
    completeOrderTotalAmount: 4460,

    meatCategory: {
      meatOrderId: "MEAT-1012",
      isApproved: true,
      categoryTotal: 2740,
      meatItems: [
        {
          rawMaterialCode: "RM-CHK-003",
          rawMaterialName: "Whole Chicken",
          unitMeasurement: "pc",
          quantity: 12,
          price: 220,
        },
      ],
    },

    snowfrostCategory: {
      snowFrostOrderId: "SNOW-1012",
      isApproved: true,
      categoryTotal: 1570,
      snowFrostItems: [
        {
          rawMaterialCode: "RM-ICE-002",
          rawMaterialName: "Ice Blocks",
          unitMeasurement: "block",
          quantity: 14,
          price: 80,
        },
        {
          rawMaterialCode: "RM-SNOW-002",
          rawMaterialName: "Snow Frost Mix",
          unitMeasurement: "pack",
          quantity: 9,
          price: 50,
        },
      ],
    },
  },

  {
    orderId: 1013,
    branchName: "Papiverse – Rosario",
    orderDate: "2026-01-30",
    status: "REJECTED",
    remarks: "Snow frost items unavailable",
    deliveryFee: 140,
    completeOrderTotalAmount: 3180,

    meatCategory: {
      meatOrderId: "MEAT-1013",
      isApproved: true,
      categoryTotal: 2200,
      meatItems: [
        {
          rawMaterialCode: "RM-PORK-002",
          rawMaterialName: "Pork Chop",
          unitMeasurement: "kg",
          quantity: 5,
          price: 440,
        },
      ],
    },

    snowfrostCategory: {
      snowFrostOrderId: "SNOW-1013",
      isApproved: false,
      categoryTotal: 840,
      snowFrostItems: [
        {
          rawMaterialCode: "RM-ICE-001",
          rawMaterialName: "Crushed Ice",
          unitMeasurement: "bag",
          quantity: 12,
          price: 50,
        },
        {
          rawMaterialCode: "RM-SNOW-006",
          rawMaterialName: "Snow Frost Stabilizer",
          unitMeasurement: "pack",
          quantity: 4,
          price: 60,
        },
      ],
    },
  },
];
// or export default orders;
