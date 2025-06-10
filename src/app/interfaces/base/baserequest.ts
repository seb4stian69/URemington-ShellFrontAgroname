import { Header } from "./header";

export interface BaseRequest<E> {
  header: Header;
  body: E;
}