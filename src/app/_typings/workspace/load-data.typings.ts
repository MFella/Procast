export type LoadDataEventPayloads = {
  success: {
    seriesData: Map<string, any>;
  };
  fail: {
    message: string;
  };
};
