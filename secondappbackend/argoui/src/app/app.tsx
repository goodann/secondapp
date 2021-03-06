import {createBrowserHistory} from 'history';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Redirect, Route, MemoryRouter as Router, Switch } from 'react-router';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import Link from '@material-ui/core/Link';

import { Layout, NavigationManager, NotificationsManager, Popup, PopupManager, PopupProps } from 'argo-ui';
import {ContextApis, Provider} from './shared/context';

//import { NotificationType } from 'argo-ui';
import {Version} from '../models';
import archivedWorkflows from './archived-workflows';
import clusterWorkflowTemplates from './cluster-workflow-templates';
import cronWorkflows from './cron-workflows';
import login from './login';
import reports from './reports';
import ErrorBoundary from './shared/components/error-boundary';
import {services} from './shared/services';
import {Utils} from './shared/utils';
import userinfo from './userinfo';
import workflowTemplates from './workflow-templates';
import workflows from './workflows';

const workflowsUrl = '/workflows';
const workflowTemplatesUrl = '/workflow-templates';
const clusterWorkflowTemplatesUrl = '/cluster-workflow-templates';
const cronWorkflowsUrl = '/cron-workflows';
const archivedWorkflowsUrl = '/archived-workflows';
const userInfoUrl = '/userinfo';
const loginUrl = '/login';
const timelineUrl = '/timeline';
const reportsUrl = '/reports';

export const history = createBrowserHistory();

const navItems = [
    {
        title: 'Timeline',
        path: workflowsUrl,
        iconClassName: 'fa fa-stream'
    },
    {
        title: 'Workflow Templates',
        path: workflowTemplatesUrl,
        iconClassName: 'fa fa-window-maximize'
    },
    {
        title: 'Cluster Workflow Templates',
        path: clusterWorkflowTemplatesUrl,
        iconClassName: 'fa fa-window-restore'
    },
    {
        title: 'Cron Workflows',
        path: cronWorkflowsUrl,
        iconClassName: 'fa fa-clock'
    },
    {
        title: 'Archived Workflows',
        path: archivedWorkflowsUrl,
        iconClassName: 'fa fa-archive'
    },
    {
        title: 'Reports',
        path: reportsUrl,
        iconClassName: 'fa fa-chart-bar'
    },
    {
        title: 'User',
        path: userInfoUrl,
        iconClassName: 'fa fa-user-alt'
    }
];

export class App extends React.Component<{}, {version?: Version; popupProps: PopupProps; namespace?: string}> {
    public static childContextTypes = {
        history: PropTypes.object,
        apis: PropTypes.object
    };

    private user: any;

    private popupManager: PopupManager;
    private notificationsManager: NotificationsManager;
    private navigationManager: NavigationManager;

    constructor(props: {}) {
        super(props);
        this.state = {popupProps: null};
        this.popupManager = new PopupManager();
        this.notificationsManager = new NotificationsManager();
        this.navigationManager = new NavigationManager(history);
        Utils.onNamespaceChange = namespace => {
            this.setState({namespace});
        };
        Utils.getAccountUser().then(
            user => this.user = user
        ).catch(err => console.error(err));
    }

    public componentDidMount() {
        this.popupManager.popupProps.subscribe(popupProps => this.setState({popupProps}));
        services.info
            .getVersion()
            .then(version => this.setState({version}))
            .then(() => services.info.getInfo())
            .then(info => this.setState({ namespace: this.user['primary_namespace_name'] || 'default'}))
            .catch(error => {
                console.error(error);
                /*this.notificationsManager.show({
                    content: 'Failed to load ' + error,
                    type: NotificationType.Error
                });*/
            });
    }

    public render() {
        return (
            <Router>
                <div>
                    <Link component={RouterLink} to={workflowsUrl}>
                        Workflows
                    </Link>
                    <br />
                    <Link component={RouterLink} to={workflowTemplatesUrl}>
                        Workflow Templates
                    </Link>
                </div>
                <Route exact path='/' component={workflows.component} />
                <Route path={workflowsUrl} component={workflows.component} />
                <Route path={workflowTemplatesUrl} component={workflowTemplates.component} />
            </Router>
        );
    }

    private get archivedWorkflowsUrl() {
        return archivedWorkflowsUrl + '/' + (this.state.namespace || '');
    }

    private get cronWorkflowsUrl() {
        return cronWorkflowsUrl + '/' + (this.state.namespace || '');
    }

    private get workflowTemplatesUrl() {
        return workflowTemplatesUrl + '/' + (this.state.namespace || '');
    }

    private get workflowsUrl() {
        return workflowsUrl + '/' + (this.state.namespace || '');
    }

    private get reportsUrl() {
        return reportsUrl + '/' + (this.state.namespace || '');
    }

    public getChildContext() {
        return {
            history,
            apis: {
                popup: this.popupManager,
                notifications: this.notificationsManager
            }
        };
    }
}
