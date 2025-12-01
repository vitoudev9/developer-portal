import {
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import { TemplateCardComponent } from '../TemplateCardComponent';
import { discoveryApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';

export const TemplateFetchComponent = () => {

  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);

  const {value, loading, error} = useAsync(async () => {
    const baseUrl = await discoveryApi.getBaseUrl('template-repo');
    const response = await fetchApi.fetch(`${baseUrl}/templates`);
    return response.json();
  }, [fetchApi, discoveryApi])

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <TemplateCardComponent templates={value.items || []} />;;
};
