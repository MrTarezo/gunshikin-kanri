/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateExpense = /* GraphQL */ `
  subscription OnCreateExpense($filter: ModelSubscriptionExpenseFilterInput) {
    onCreateExpense(filter: $filter) {
      id
      title
      amount
      paidBy
      comment
      date
      type
      createdAt
      updatedAt
      receipt
      __typename
    }
  }
`;
export const onUpdateExpense = /* GraphQL */ `
  subscription OnUpdateExpense($filter: ModelSubscriptionExpenseFilterInput) {
    onUpdateExpense(filter: $filter) {
      id
      title
      amount
      paidBy
      comment
      date
      type
      createdAt
      updatedAt
      receipt
      __typename
    }
  }
`;
export const onDeleteExpense = /* GraphQL */ `
  subscription OnDeleteExpense($filter: ModelSubscriptionExpenseFilterInput) {
    onDeleteExpense(filter: $filter) {
      id
      title
      amount
      paidBy
      comment
      date
      type
      createdAt
      updatedAt
      receipt
      __typename
    }
  }
`;
export const onCreateReceipt = /* GraphQL */ `
  subscription OnCreateReceipt($filter: ModelSubscriptionReceiptFilterInput) {
    onCreateReceipt(filter: $filter) {
      id
      imageKey
      uploadedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateReceipt = /* GraphQL */ `
  subscription OnUpdateReceipt($filter: ModelSubscriptionReceiptFilterInput) {
    onUpdateReceipt(filter: $filter) {
      id
      imageKey
      uploadedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteReceipt = /* GraphQL */ `
  subscription OnDeleteReceipt($filter: ModelSubscriptionReceiptFilterInput) {
    onDeleteReceipt(filter: $filter) {
      id
      imageKey
      uploadedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
