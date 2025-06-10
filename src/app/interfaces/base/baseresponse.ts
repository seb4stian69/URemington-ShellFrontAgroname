import { BaseError } from "./baserror";
import { Header } from "./header";

export interface BaseHeader<E> {
  header: Header;
  body: E;
  error: BaseError;
}