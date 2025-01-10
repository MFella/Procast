export type LoadDataEventPayloads = {
  success: {
    seriesData: Map<string, any>;
  };
  fail: {
    message: string;
  };
};

// [name, fileType]
export type DisplayPredefinedFile = [string, string];
