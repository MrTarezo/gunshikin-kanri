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
      settled
      settlementMonth
      category
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
      settled
      settlementMonth
      category
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
      settled
      settlementMonth
      category
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
export const onCreateTodo = /* GraphQL */ `
  subscription OnCreateTodo($filter: ModelSubscriptionTodoFilterInput) {
    onCreateTodo(filter: $filter) {
      id
      title
      done
      owner
      dueDate
      assignee
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateTodo = /* GraphQL */ `
  subscription OnUpdateTodo($filter: ModelSubscriptionTodoFilterInput) {
    onUpdateTodo(filter: $filter) {
      id
      title
      done
      owner
      dueDate
      assignee
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteTodo = /* GraphQL */ `
  subscription OnDeleteTodo($filter: ModelSubscriptionTodoFilterInput) {
    onDeleteTodo(filter: $filter) {
      id
      title
      done
      owner
      dueDate
      assignee
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateFridgeItem = /* GraphQL */ `
  subscription OnCreateFridgeItem(
    $filter: ModelSubscriptionFridgeItemFilterInput
  ) {
    onCreateFridgeItem(filter: $filter) {
      id
      name
      addedDate
      location
      isUrgent
      image
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateFridgeItem = /* GraphQL */ `
  subscription OnUpdateFridgeItem(
    $filter: ModelSubscriptionFridgeItemFilterInput
  ) {
    onUpdateFridgeItem(filter: $filter) {
      id
      name
      addedDate
      location
      isUrgent
      image
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteFridgeItem = /* GraphQL */ `
  subscription OnDeleteFridgeItem(
    $filter: ModelSubscriptionFridgeItemFilterInput
  ) {
    onDeleteFridgeItem(filter: $filter) {
      id
      name
      addedDate
      location
      isUrgent
      image
      createdAt
      updatedAt
      __typename
    }
  }
`;
