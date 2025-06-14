/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createExpense = /* GraphQL */ `
  mutation CreateExpense(
    $input: CreateExpenseInput!
    $condition: ModelExpenseConditionInput
  ) {
    createExpense(input: $input, condition: $condition) {
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
export const updateExpense = /* GraphQL */ `
  mutation UpdateExpense(
    $input: UpdateExpenseInput!
    $condition: ModelExpenseConditionInput
  ) {
    updateExpense(input: $input, condition: $condition) {
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
export const deleteExpense = /* GraphQL */ `
  mutation DeleteExpense(
    $input: DeleteExpenseInput!
    $condition: ModelExpenseConditionInput
  ) {
    deleteExpense(input: $input, condition: $condition) {
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
export const createReceipt = /* GraphQL */ `
  mutation CreateReceipt(
    $input: CreateReceiptInput!
    $condition: ModelReceiptConditionInput
  ) {
    createReceipt(input: $input, condition: $condition) {
      id
      imageKey
      uploadedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateReceipt = /* GraphQL */ `
  mutation UpdateReceipt(
    $input: UpdateReceiptInput!
    $condition: ModelReceiptConditionInput
  ) {
    updateReceipt(input: $input, condition: $condition) {
      id
      imageKey
      uploadedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteReceipt = /* GraphQL */ `
  mutation DeleteReceipt(
    $input: DeleteReceiptInput!
    $condition: ModelReceiptConditionInput
  ) {
    deleteReceipt(input: $input, condition: $condition) {
      id
      imageKey
      uploadedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTodo = /* GraphQL */ `
  mutation CreateTodo(
    $input: CreateTodoInput!
    $condition: ModelTodoConditionInput
  ) {
    createTodo(input: $input, condition: $condition) {
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
export const updateTodo = /* GraphQL */ `
  mutation UpdateTodo(
    $input: UpdateTodoInput!
    $condition: ModelTodoConditionInput
  ) {
    updateTodo(input: $input, condition: $condition) {
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
export const deleteTodo = /* GraphQL */ `
  mutation DeleteTodo(
    $input: DeleteTodoInput!
    $condition: ModelTodoConditionInput
  ) {
    deleteTodo(input: $input, condition: $condition) {
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
