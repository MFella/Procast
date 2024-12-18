import { Injectable } from '@angular/core';
import { read, utils } from 'xlsx';
import { WorksheetRowData } from '../_typings/worksheet.typings';

@Injectable({
  providedIn: 'root',
})
export class FileReaderService {
  private static readonly RESERVED_LABEL_HEADER_TEXT = 'Label';
  private static readonly RESERVED_VALUE_HEADER_TEXT = 'Value';

  private static readonly ALLOWED_FILE_MIME_TYPES: [string, string] = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ];
  private fileReader: FileReader = new FileReader();

  constructor() {}

  async readAndParseFile(fileList: FileList | null): Promise<Map<string, any>> {
    const fileToRead = fileList?.item(0);
    if (!fileToRead) {
      return new Map<string, any>();
    }

    if (!FileReaderService.ALLOWED_FILE_MIME_TYPES.includes(fileToRead.type)) {
      throw new Error(`Not supported file mime type: ${fileToRead.type}`);
    }

    if (fileToRead.type === FileReaderService.ALLOWED_FILE_MIME_TYPES[0]) {
      return this.parseXlsxFile(fileToRead);
    }

    return this.parseCsvFile(fileToRead);
  }

  private async parseXlsxFile(xlsxFile: File): Promise<Map<string, any>> {
    const arrayBuffer = await xlsxFile.arrayBuffer();
    const parsedWorkbook = await read(arrayBuffer);
    const firstWorksheet = parsedWorkbook.Sheets[parsedWorkbook.SheetNames[0]];
    const sheetData: Array<Record<string, string>> =
      utils.sheet_to_json<Record<string, string>>(firstWorksheet);

    return new Promise((resolve, reject) => {
      try {
        resolve(this.convertXlsxEntriesToMap(sheetData));
      } catch (err: unknown) {
        reject(err);
      }
    });
  }

  private async parseCsvFile(
    csvFile: File
  ): Promise<Map<string, WorksheetRowData>> {
    return new Promise((resolve, reject) => {
      this.fileReader.readAsText(csvFile);
      this.fileReader.onload = (e) => {
        let fileReaderResult: string = this.fileReader.result as string;
        try {
          resolve(this.convertCsvStringToMap(fileReaderResult));
        } catch (err: unknown) {
          reject(err);
        }
      };
    });
  }

  private convertCsvStringToMap(
    csvString: string
  ): Map<string, WorksheetRowData> {
    let splittedCsvString: Array<string> = csvString
      .split('\n')
      .filter(Boolean)
      .slice(0, 2);

    if (splittedCsvString.length !== 2) {
      throw new Error('Provided data is has not got appropriate length');
    }

    const csvValues =
      (splittedCsvString
        .map((phrase, index) => {
          // first index (headers) - dont take that into account
          if (index === 0) {
            return null;
          }

          const encodedPhrases: [string, string] = phrase
            .split(',')
            .slice(0, 2) as [string, string];
          if (encodedPhrases.length !== 2) {
            throw new Error('Provided data is has not got appropriate length');
          }

          return encodedPhrases.map((phrase, index, array) => {
            if (index === 1) {
              const parseIntResult = parseInt(phrase);
              if (!isNaN(parseIntResult)) {
                return {
                  label: array[index - 1],
                  value: parseIntResult,
                };
              }
              throw new Error(`Key ${phrase} is not int-like! Correct it`);
            }
            return phrase;
          }) as [string, WorksheetRowData];
        })
        .filter(Boolean) as Array<[string, WorksheetRowData]>) ?? [];

    // presumably first value would be 'headers'
    // those values should be ommited
    splittedCsvString.shift();

    return new Map<string, WorksheetRowData>(csvValues);
  }

  private convertXlsxEntriesToMap(
    xlsxEntries: Array<Record<string, string>>
  ): Map<string, WorksheetRowData> {
    const convertedXlsxObject: Array<[string, WorksheetRowData]> =
      xlsxEntries.map((entry: Record<string, string>) => {
        const parsedIntValue = parseInt(
          entry[FileReaderService.RESERVED_VALUE_HEADER_TEXT]
        );
        if (
          !(FileReaderService.RESERVED_LABEL_HEADER_TEXT in entry) ||
          !(FileReaderService.RESERVED_VALUE_HEADER_TEXT in entry)
        ) {
          throw new Error(
            'Reserved header labels are not present in xlsx file'
          );
        }

        if (isNaN(parsedIntValue)) {
          throw new Error(
            `Key ${
              entry[FileReaderService.RESERVED_VALUE_HEADER_TEXT]
            } from attached file is not int-like. Correct it`
          );
        }
        return [
          entry[FileReaderService.RESERVED_LABEL_HEADER_TEXT],
          {
            label: entry[FileReaderService.RESERVED_LABEL_HEADER_TEXT],
            value: parsedIntValue,
          },
        ];
      });
    return new Map<string, WorksheetRowData>(convertedXlsxObject);
  }
}
