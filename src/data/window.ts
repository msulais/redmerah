import { _body, _documentElement } from "./string"

export const getDocument    : () => Document    = () => document
export const getDocumentBody: () => HTMLElement = () => getDocument()[_body]
export const getWindow      : () => Window      = () => window
export const getRoot        : () => HTMLElement = () => getDocument()[_documentElement]
export const getNavigator   : () => Navigator   = () => navigator
export const getLocation    : () => Location    = () => location
export const getIndexedDB   : () => IDBFactory  = () => indexedDB
export const getConsole     : () => Console     = () => console