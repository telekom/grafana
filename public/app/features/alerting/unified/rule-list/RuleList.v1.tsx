import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAsyncFn, useInterval } from 'react-use';

import { t } from '@grafana/i18n';
import { Button, Stack } from '@grafana/ui';
import { useQueryParams } from 'app/core/hooks/useQueryParams';
import { useDispatch } from 'app/types/store';
import { CombinedRuleNamespace } from 'app/types/unified-alerting';

import { trackRuleListNavigation } from '../Analytics';
import { AlertingPageWrapper } from '../components/AlertingPageWrapper';
import RulesFilter from '../components/rules/Filter/RulesFilter.v1';
import { NoRulesSplash } from '../components/rules/NoRulesCTA';
import { INSTANCES_DISPLAY_LIMIT } from '../components/rules/RuleDetails';
import { RuleListErrors } from '../components/rules/RuleListErrors';
import { RuleListGroupView } from '../components/rules/RuleListGroupView';
import { RuleListStateView } from '../components/rules/RuleListStateView';
import { RuleStats } from '../components/rules/RuleStats';
import { shouldUsePrometheusRulesPrimary } from '../featureToggles';
import { useCombinedRuleNamespaces } from '../hooks/useCombinedRuleNamespaces';
import { useFilteredRules, useRulesFilter } from '../hooks/useFilteredRules';
import { useUnifiedAlertingSelector } from '../hooks/useUnifiedAlertingSelector';
import { fetchAllPromAndRulerRulesAction, fetchAllPromRulesAction, fetchRulerRulesAction } from '../state/actions';
import { RULE_LIST_POLL_INTERVAL_MS } from '../utils/constants';
import { GRAFANA_RULES_SOURCE_NAME, getAllRulesSourceNames } from '../utils/datasource';

import { RuleListPageTitle } from './RuleListPageTitle';
import { RuleListActionButtons } from './components/RuleListActionButtons';

const VIEWS = {
  groups: RuleListGroupView,
  state: RuleListStateView,
};

// make sure we ask for 1 more so we show the "show x more" button
const LIMIT_ALERTS = INSTANCES_DISPLAY_LIMIT + 1;

const prometheusRulesPrimary = shouldUsePrometheusRulesPrimary();

const RuleListV1 = () => {
  const dispatch = useDispatch();
  const rulesDataSourceNames = useMemo(getAllRulesSourceNames, []);
  const [expandAll, setExpandAll] = useState(false);

  const onFilterCleared = useCallback(() => setExpandAll(false), []);

  const [queryParams] = useQueryParams();
  const { filterState, hasActiveFilters } = useRulesFilter();

  const hasActiveLabelsFilter = filterState.labels.length > 0;

  const queryParamView = queryParams.view;
  const viewType = queryParamView === 'state' || queryParamView === 'groups' ? queryParamView : 'groups';
  const view = VIEWS[viewType] ? viewType : 'groups';

  const ViewComponent = VIEWS[view];

  const promRuleRequests = useUnifiedAlertingSelector((state) => state.promRules);
  const rulerRuleRequests = useUnifiedAlertingSelector((state) => state.rulerRules);

  const loading = rulesDataSourceNames.some(
    (name) => promRuleRequests[name]?.loading || rulerRuleRequests[name]?.loading
  );

  const promRequests = Object.entries(promRuleRequests);
  const rulerRequests = Object.entries(rulerRuleRequests);

  const allPromLoaded = promRequests.every(
    ([_, state]) => state.dispatched && (state?.result !== undefined || state?.error !== undefined)
  );
  const allRulerLoaded = rulerRequests.every(
    ([_, state]) => state.dispatched && (state?.result !== undefined || state?.error !== undefined)
  );

  const allPromEmpty = promRequests.every(([_, state]) => state.dispatched && state?.result?.length === 0);

  const allRulerEmpty = rulerRequests.every(([_, state]) => {
    const rulerRules = Object.entries(state?.result ?? {});
    const noRules = rulerRules.every(([_, result]) => result?.length === 0);
    return noRules && state.dispatched;
  });

  const limitAlerts = hasActiveLabelsFilter ? undefined : LIMIT_ALERTS;
  // Trigger data refresh only when the RULE_LIST_POLL_INTERVAL_MS elapsed since the previous load FINISHED
  const [_, fetchRules] = useAsyncFn(async () => {
    if (!loading) {
      if (prometheusRulesPrimary) {
        await dispatch(fetchRulerRulesAction({ rulesSourceName: GRAFANA_RULES_SOURCE_NAME }));
        await dispatch(fetchAllPromRulesAction(false, { limitAlerts }));
      } else {
        await dispatch(fetchAllPromAndRulerRulesAction(false, { limitAlerts }));
      }
    }
  }, [loading, limitAlerts, dispatch]);

  useEffect(() => {
    trackRuleListNavigation().catch(() => {});
  }, []);

  // fetch rules, then poll every RULE_LIST_POLL_INTERVAL_MS
  useEffect(() => {
    if (prometheusRulesPrimary) {
      dispatch(fetchRulerRulesAction({ rulesSourceName: GRAFANA_RULES_SOURCE_NAME }));
      dispatch(fetchAllPromRulesAction(false, { limitAlerts }));
    } else {
      dispatch(fetchAllPromAndRulerRulesAction(false, { limitAlerts }));
    }
  }, [dispatch, limitAlerts]);
  useInterval(fetchRules, RULE_LIST_POLL_INTERVAL_MS);

  // Show splash only when we loaded all of the data sources and none of them has alerts
  const hasNoAlertRulesCreatedYet =
    allPromLoaded && allPromEmpty && promRequests.length > 0 && allRulerEmpty && allRulerLoaded;
  const hasAlertRulesCreated = !hasNoAlertRulesCreatedYet;

  const combinedNamespaces: CombinedRuleNamespace[] = useCombinedRuleNamespaces();
  const filteredNamespaces = useFilteredRules(combinedNamespaces, filterState);
  return (
    // We don't want to show the Loading... indicator for the whole page.
    // We show separate indicators for Grafana-managed and Cloud rules
    <AlertingPageWrapper
      navId="alert-list"
      isLoading={false}
      renderTitle={(title) => <RuleListPageTitle title={title} />}
      actions={<RuleListActionButtons hasAlertRulesCreated={hasAlertRulesCreated} />}
    >
      <Stack direction="column">
        <RuleListErrors />
        <RulesFilter onClear={onFilterCleared} />
        {hasAlertRulesCreated && (
          <Stack direction="row" alignItems="center">
            {view === 'groups' && hasActiveFilters && (
              <Button
                icon={expandAll ? 'angle-double-up' : 'angle-double-down'}
                variant="secondary"
                onClick={() => setExpandAll(!expandAll)}
              >
                {expandAll
                  ? t('alerting.rule-list-v1.collapse-all', 'Collapse all')
                  : t('alerting.rule-list-v1.expand-all', 'Expand all')}
              </Button>
            )}
          </Stack>
        )}
        <RuleStats namespaces={filteredNamespaces} />
        {hasNoAlertRulesCreatedYet && <NoRulesSplash />}
        {hasAlertRulesCreated && <ViewComponent expandAll={expandAll} namespaces={filteredNamespaces} />}
      </Stack>
    </AlertingPageWrapper>
  );
};

export default RuleListV1;
