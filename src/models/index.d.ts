import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";





type EagerExpense = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Expense, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly amount: number;
  readonly paidBy: string;
  readonly comment?: string | null;
  readonly date: string;
  readonly type?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly receipt?: string | null;
}

type LazyExpense = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Expense, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly amount: number;
  readonly paidBy: string;
  readonly comment?: string | null;
  readonly date: string;
  readonly type?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly receipt?: string | null;
}

export declare type Expense = LazyLoading extends LazyLoadingDisabled ? EagerExpense : LazyExpense

export declare const Expense: (new (init: ModelInit<Expense>) => Expense) & {
  copyOf(source: Expense, mutator: (draft: MutableModel<Expense>) => MutableModel<Expense> | void): Expense;
}

type EagerReceipt = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Receipt, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly imageKey: string;
  readonly uploadedAt: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyReceipt = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Receipt, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly imageKey: string;
  readonly uploadedAt: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Receipt = LazyLoading extends LazyLoadingDisabled ? EagerReceipt : LazyReceipt

export declare const Receipt: (new (init: ModelInit<Receipt>) => Receipt) & {
  copyOf(source: Receipt, mutator: (draft: MutableModel<Receipt>) => MutableModel<Receipt> | void): Receipt;
}