import { useFormContext } from 'react-hook-form';

import { useCreateRepositoryMigrateMutation } from 'app/api/clients/provisioning';

import { StepStatus } from '../hooks/useStepStatus';

import { JobStep } from './JobStep';
import { WizardFormData } from './types';

export interface MigrateStepProps {
  onStepUpdate: (status: StepStatus, error?: string) => void;
}

export function MigrateStep({ onStepUpdate }: MigrateStepProps) {
  const [migrateRepo] = useCreateRepositoryMigrateMutation();
  const { watch } = useFormContext<WizardFormData>();
  const identifier = watch('migrate.identifier');
  const history = watch('migrate.history');

  const startMigration = async (repositoryName: string) => {
    const response = await migrateRepo({
      name: repositoryName,
      body: { identifier, history },
    }).unwrap();

    return response;
  };

  return (
    <JobStep
      onStepUpdate={onStepUpdate}
      description="Migrating all dashboards from this instance to your repository, including their identifiers and complete
        history. After this one-time migration, all future updates will be automatically saved to the repository."
      startJob={startMigration}
    />
  );
}
