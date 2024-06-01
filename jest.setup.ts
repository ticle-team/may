import 'reflect-metadata';
import '@testing-library/jest-dom';
import '@testing-library/react';
import 'disposablestack/auto';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Symbol.dispose ??= Symbol('Symbol.dispose');
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');
