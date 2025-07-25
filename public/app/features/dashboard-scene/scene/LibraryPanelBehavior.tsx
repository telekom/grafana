import { PanelPlugin, PanelProps } from '@grafana/data';
import { Trans } from '@grafana/i18n';
import { config } from '@grafana/runtime';
import { SceneObject, SceneObjectBase, SceneObjectState, sceneUtils, VizPanel, VizPanelState } from '@grafana/scenes';
import { LibraryPanel } from '@grafana/schema';
import { Stack } from '@grafana/ui';
import { PanelModel } from 'app/features/dashboard/state/PanelModel';
import { getLibraryPanel } from 'app/features/library-panels/state/api';

import { createPanelDataProvider } from '../utils/createPanelDataProvider';
import { getPanelIdForVizPanel } from '../utils/utils';

import { VizPanelLinks, VizPanelLinksMenu } from './PanelLinks';
import { panelLinksBehavior } from './PanelMenuBehavior';
import { PanelNotices } from './PanelNotices';
import { PanelTimeRange } from './PanelTimeRange';
import { DashboardGridItem } from './layout-default/DashboardGridItem';

export interface LibraryPanelBehaviorState extends SceneObjectState {
  uid: string;
  name: string;
  isLoaded?: boolean;
  _loadedPanel?: LibraryPanel;
}

export class LibraryPanelBehavior extends SceneObjectBase<LibraryPanelBehaviorState> {
  public static LOADING_VIZ_PANEL_PLUGIN_ID = 'library-panel-loading-plugin';

  public constructor(state: LibraryPanelBehaviorState) {
    super(state);

    this.addActivationHandler(() => this._activationHandler());
  }

  private _activationHandler() {
    if (!this.state.isLoaded) {
      this.loadLibraryPanelFromPanelModel();
    }
  }

  public setPanelFromLibPanel(libPanel: LibraryPanel) {
    if (this.state._loadedPanel?.version === libPanel.version) {
      return;
    }

    const vizPanel = this.parent;

    if (!(vizPanel instanceof VizPanel)) {
      return;
    }

    const libPanelModel = new PanelModel(libPanel.model);

    // Use dashboard panel ID for data layer filtering
    const dashboardPanelId = getPanelIdForVizPanel(vizPanel);
    libPanelModel.id = dashboardPanelId;

    const titleItems: SceneObject[] = [];

    titleItems.push(
      new VizPanelLinks({
        rawLinks: libPanelModel.links,
        menu: new VizPanelLinksMenu({ $behaviors: [panelLinksBehavior] }),
      })
    );
    titleItems.push(new PanelNotices());

    let title;
    if (config.featureToggles.preferLibraryPanelTitle) {
      title = libPanelModel.title ?? vizPanel.state.title;
    } else {
      title = vizPanel.state.title ?? libPanelModel.title;
    }

    const vizPanelState: VizPanelState = {
      title,
      options: libPanelModel.options ?? {},
      fieldConfig: libPanelModel.fieldConfig,
      pluginId: libPanelModel.type,
      pluginVersion: libPanelModel.pluginVersion,
      displayMode: libPanelModel.transparent ? 'transparent' : undefined,
      description: libPanelModel.description,
      titleItems: titleItems,
      $data: createPanelDataProvider(libPanelModel),
    };

    if (libPanelModel.timeFrom || libPanelModel.timeShift) {
      vizPanelState.$timeRange = new PanelTimeRange({
        timeFrom: libPanelModel.timeFrom,
        timeShift: libPanelModel.timeShift,
        hideTimeOverride: libPanelModel.hideTimeOverride,
      });
    }

    vizPanel.setState(vizPanelState);
    vizPanel.changePluginType(libPanelModel.type, vizPanelState.options, vizPanelState.fieldConfig);

    this.setState({ _loadedPanel: libPanel, isLoaded: true, name: libPanel.name });

    const layoutElement = vizPanel.parent!;

    // Migrate repeat options to layout element
    if (libPanelModel.repeat && layoutElement instanceof DashboardGridItem) {
      layoutElement.setState({
        variableName: libPanelModel.repeat,
        repeatDirection: libPanelModel.repeatDirection === 'h' ? 'h' : 'v',
        maxPerRow: libPanelModel.maxPerRow,
        itemHeight: layoutElement.state.height ?? 10,
      });
      layoutElement.performRepeat();
    }
  }

  /**
   * Removes itself from the parent panel's behaviors array
   */
  public unlink() {
    const panel = this.parent;
    if (panel instanceof VizPanel) {
      panel.setState({ $behaviors: panel.state.$behaviors?.filter((b) => b !== this) });
    }
  }

  private async loadLibraryPanelFromPanelModel() {
    let vizPanel = this.parent;

    if (!(vizPanel instanceof VizPanel)) {
      return;
    }

    try {
      const libPanel = await getLibraryPanel(this.state.uid, true);
      this.setPanelFromLibPanel(libPanel);
    } catch (err) {
      vizPanel.setState({
        _pluginLoadError: `Unable to load library panel: ${this.state.uid}`,
      });
    }
  }
}

const LoadingVizPanelPlugin = new PanelPlugin(LoadingVizPanel);

function LoadingVizPanel(props: PanelProps) {
  return (
    <Stack direction={'column'} justifyContent={'space-between'}>
      <Trans i18nKey="library-panels.loading-panel-text">Loading library panel</Trans>
    </Stack>
  );
}

sceneUtils.registerRuntimePanelPlugin({
  pluginId: LibraryPanelBehavior.LOADING_VIZ_PANEL_PLUGIN_ID,
  plugin: LoadingVizPanelPlugin,
});
