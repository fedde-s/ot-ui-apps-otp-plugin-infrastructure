import { SummaryItem, usePlatformApi } from "ui";

function Summary(data) {
  const request = { loading: false, data: [], error: false };
  
  const definition = {
    id: "plugin",
    name: data.title,
    shortName: data.acronym,
    hasData: () => true,
    isPlugin: true,
  };
  return (
    <SummaryItem
      definition={definition}
      request={request}
    />
  );
}

export default Summary;
