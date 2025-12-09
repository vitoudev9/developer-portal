import { useEffect, useState } from 'react';
import {
  Content,
  Progress,
  WarningPanel,
  InfoCard
} from '@backstage/core-components';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  Box
} from '@material-ui/core';
import { useApi, fetchApiRef } from '@backstage/core-plugin-api';

type Principal = {
  id: string;
  name: string;
  type: 'group' | 'user';
};

type PermissionAssignment = {
  principals: string[];
  permission: string;
};

export const PermissionAssignmentCard = () => {
  const fetchApi = useApi(fetchApiRef);

  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrincipals, setSelectedPrincipals] = useState<string[]>([]);
  const [selectedPermission, setSelectedPermission] = useState('');
  const [error, setError] = useState('');

  const availablePermissions = [
    'catalog.read',
    'catalog.write',
    'scaffolder.action.execute',
    'myplugin.admin',
  ];

  useEffect(() => {
    const loadPrincipals = async () => {
      try {
        const res = await fetchApi.fetch('/api/keycloak/principals');
        const data = await res.json();
        setPrincipals(data);
      } catch (e) {
        setError('Failed to load Keycloak users/groups');
      } finally {
        setLoading(false);
      }
    };

    loadPrincipals();
  }, [fetchApi]);

  const handleAssign = async () => {
    try {
      await fetchApi.fetch('/api/permissions/assign', {
        method: 'POST',
        body: JSON.stringify({
          principals: selectedPrincipals,
          permission: selectedPermission,
        } as PermissionAssignment),
        headers: { 'Content-Type': 'application/json' },
      });

      alert('Permission assigned successfully!');
      setSelectedPrincipals([]);
      setSelectedPermission('');
    } catch (e) {
      alert('Failed to assign permission');
    }
  };

  if (loading) return <Progress />;
  if (error)
    return <WarningPanel title="Error">{error}</WarningPanel>;

  return (
    <Content>
      <InfoCard title="Keycloak Permission Assignment">
        <Box display="flex" flexDirection="column">

          {/* PRINCIPAL SELECT */}
          <FormControl fullWidth>
            <InputLabel>Users / Groups</InputLabel>
            <Select
              multiple
              value={selectedPrincipals}
              onChange={e => setSelectedPrincipals(e.target.value as string[])}
              renderValue={(selected) => (
                <Box display="flex" flexWrap="wrap">
                  {(selected as string[]).map(id => {
                    const p = principals.find(x => x.id === id);
                    return <Chip key={id} label={`${p?.name} (${p?.type})`} />;
                  })}
                </Box>
              )}
            >
              {principals.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* PERMISSION SELECT */}
          <FormControl fullWidth>
            <InputLabel>Permission</InputLabel>
            <Select
              value={selectedPermission}
              onChange={e => setSelectedPermission(e.target.value as string)}
            >
              {availablePermissions.map(p => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* SUBMIT BUTTON */}
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedPermission || selectedPrincipals.length === 0}
            onClick={handleAssign}
          >
            Assign Permission
          </Button>
        </Box>
      </InfoCard>
    </Content>
  );
};
