import { XMLParser } from "fast-xml-parser";

/**
 * Parse a string of XML into an object. Includes XML element attributes.
 * @param xml String of XML to be parsed.
 * @returns Object equivalent of the XML.
 */
export const parseXML = ({ xml }: { xml: string }) => {
  const parserOptions = {
    ignoreAttributes: false,
  };
  const parser = new XMLParser(parserOptions);
  const parsedData = parser.parse(xml);

  return parsedData;
};
