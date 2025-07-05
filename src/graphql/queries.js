/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getExpense = /* GraphQL */ `
  query GetExpense($id: ID!) {
    getExpense(id: $id) {
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
export const listExpenses = /* GraphQL */ `
  query ListExpenses(
    $filter: ModelExpenseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listExpenses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getReceipt = /* GraphQL */ `
  query GetReceipt($id: ID!) {
    getReceipt(id: $id) {
      id
      imageKey
      uploadedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listReceipts = /* GraphQL */ `
  query ListReceipts(
    $filter: ModelReceiptFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReceipts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        imageKey
        uploadedAt
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTodo = /* GraphQL */ `
  query GetTodo($id: ID!) {
    getTodo(id: $id) {
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
export const listTodos = /* GraphQL */ `
  query ListTodos(
    $filter: ModelTodoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getFridgeItem = /* GraphQL */ `
  query GetFridgeItem($id: ID!) {
    getFridgeItem(id: $id) {
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
export const listFridgeItems = /* GraphQL */ `
  query ListFridgeItems(
    $filter: ModelFridgeItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFridgeItems(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
