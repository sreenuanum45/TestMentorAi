// @types/pdf-parse only covers the package root; we import the internal
// implementation directly (see extract/route.ts for why) so it needs its own
// ambient declaration.
declare module "pdf-parse/lib/pdf-parse.js" {
  import pdfParse from "pdf-parse";
  export default pdfParse;
}
