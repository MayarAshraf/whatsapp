import { DatePipe } from '@angular/common';
import {
  assertInInjectionContext,
  Component,
  DestroyRef,
  inject,
  InjectionToken,
  signal,
  viewChild,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  EFConnectableSide,
  EFConnectionBehavior,
  EFMarkerType,
  FCanvasComponent,
  FConnectionContent,
  FCreateConnectionEvent,
  FFlowModule,
  FZoomDirective,
} from '@foblex/flow';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { combineLatest, filter, finalize, map, switchMap, tap } from 'rxjs';
import { localStorageSignal } from 'src/app/shared/helpers/utils';
import { FieldBuilderService } from 'src/app/shared/services/field-builder.service';
import { GlobalListService } from 'src/app/shared/services/global-list.service';
import { ApiService } from 'src/app/shared/services/global-services/api.service';
import { ConfirmService } from 'src/app/shared/services/global-services/confirm.service';
import { LangService } from 'src/app/shared/services/lang.service';
import { v4 as uuid } from 'uuid';
import {
  flowModel,
  TemplateModel,
  TemplateOption,
} from './services/service-type';

const isWorkspaceOpened = new InjectionToken('IS_WORKSPACE_OPEN', {
  providedIn: 'root',
  factory: () => signal<boolean>(false),
});

export function injectIsWorkspaceOpened() {
  assertInInjectionContext(injectIsWorkspaceOpened);
  return inject(isWorkspaceOpened);
}
interface FlowNode {
  step_key: string;
  name: string;
  x: number;
  y: number;
  data: TemplateModel;
}

interface FlowConnection {
  id: string;
  fOutputId: string;
  fInputId: string;
}
interface ChatFlowWorkspaceDraft {
  flowId?: number;
  nodes: FlowNode[];
  connections: FlowConnection[];
  activeNodeStepKey: string | null;
}

interface ConnectionMenuOption {
  optionIndex: number;
  optionTitle: string;
  targetStepKey: string;
  isFallback?: boolean;
}
interface FlowState {
  nodes: FlowNode[];
  connections: FlowConnection[];
}
@Component({
  selector: 'app-chat-flow',
  standalone: true,
  imports: [
    FFlowModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    TranslatePipe,
    TooltipModule,
    FormlyModule,
    ReactiveFormsModule,
    DialogModule,
    TagModule,
    DatePipe,
    SkeletonModule,
    FConnectionContent,
    MenuModule,
    PopoverModule,
    FZoomDirective,
    SelectModule,
  ],
  templateUrl: './chat-flow.component.html',
  styleUrls: ['./chat-flow.component.scss'],
})
export class ChatFlowComponent {
  #fieldBuilder = inject(FieldBuilderService);
  #globalList = inject(GlobalListService);
  #currentLang = inject(LangService).currentLanguage;
  #api = inject(ApiService);
  #destroyRef = inject(DestroyRef);
  #confirmService = inject(ConfirmService);
  #translate = inject(TranslateService);

  templateList$ = this.#globalList.getGlobalList('chat-flows');

  flowId = signal<number | undefined>(undefined);
  activeNodeStepKey = signal<string | null>(null);
  connections = signal<FlowConnection[]>([]);
  selectedNode = signal<FlowNode | null>(null);
  templatevisible = signal(false);
  loading = signal(false);
  selectedOptionIndex = signal<number | null>(null);
  isFlowLoading = signal(false);
  isLoading = signal(true);
  nodes = signal<FlowNode[]>([]);
  isWorkspaceOpened = injectIsWorkspaceOpened();
  isConnectionMenuVisible = signal(false);
  hoveredConnection = signal<string | null>(null);
  selectedConnectionOptions = signal<
    Array<{ optionIndex: number; label: string; connectionId: string }>
  >([]);
  showDeleteOptionsMenu = signal(false);
  hoveredNode = signal<string | null>(null);
  workspaceDraft = localStorageSignal<ChatFlowWorkspaceDraft | null>(
    null,
    this.getWorkspaceKey()
  );
  pendingDraft = signal<ChatFlowWorkspaceDraft | null>(null);

  newNode = signal<FlowNode>({} as FlowNode);
  connectingNode = signal<FlowNode | null>(null);
  connectingOptionIndex = signal<number | null>(null);
  connectMenuItems = signal<MenuItem[]>([]);
  connectionMenuVisible = signal(false);
  connectionMenuPosition = signal({ x: 0, y: 0 });
  selectedConnection = signal<FlowConnection | null>(null);
  connectionMenuOptions = signal<ConnectionMenuOption[]>([]);
  background = signal('rect');
  backgroundOptions = ['circle', 'rect', 'none'];

  // Undo/Redo state
  #history: FlowState[] = [];
  #historyIndex = -1;
  #maxHistorySize = 50;
  canUndo = signal(false);
  canRedo = signal(false);
  #positionChangeTimeout: ReturnType<typeof setTimeout> | null = null;
  #pendingPositionChanges = new Map<string, { x: number; y: number }>();
  #isRestoringState = false;

  templateModel: TemplateModel = new TemplateModel();
  flowModel: flowModel = new flowModel();
  templateForm = new FormGroup({});
  flowForm = new FormGroup({});

  eConnectionBehaviour = EFConnectionBehavior;
  readonly eMarkerType = EFMarkerType;
  readonly eConnectableSide = EFConnectableSide;
  readonly fCanvas = viewChild.required(FCanvasComponent);
  fZoom = viewChild(FZoomDirective);

  connectMenu = viewChild<Menu>('connectMenu');

  constructor() {
    this.saveStateToHistory();

    // Keyboard shortcuts for undo/redo
    document.addEventListener('keydown', (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === 'z' &&
        !event.shiftKey
      ) {
        event.preventDefault();
        this.undo();
      } else if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === 'y' || (event.key === 'z' && event.shiftKey))
      ) {
        event.preventDefault();
        this.redo();
      }
    });

    document.addEventListener('click', () => {
      this.closeConnectionMenu();
    });
  }

  onZoomIn(): void {
    this.fZoom()?.zoomIn();
  }

  onZoomOut(): void {
    this.fZoom()?.zoomOut();
  }

  reset(): void {
    this.fZoom()?.reset();
  }

  saveStateToHistory(): void {
    if (this.#isRestoringState) return;

    const currentState: FlowState = {
      nodes: JSON.parse(JSON.stringify(this.nodes())),
      connections: JSON.parse(JSON.stringify(this.connections())),
    };

    // Remove any future history if we're not at the end
    if (this.#historyIndex < this.#history.length - 1) {
      this.#history = this.#history.slice(0, this.#historyIndex + 1);
    }

    // Add new state to history
    this.#history.push(currentState);

    // Limit history size
    if (this.#history.length > this.#maxHistorySize) {
      this.#history.shift();
    } else {
      this.#historyIndex++;
    }

    this.updateUndoRedoState();
  }

  restoreStateFromHistory(state: FlowState): void {
    this.#isRestoringState = true;
    this.nodes.set(JSON.parse(JSON.stringify(state.nodes)));
    this.connections.set(JSON.parse(JSON.stringify(state.connections)));
    this.#isRestoringState = false;
  }

  updateUndoRedoState(): void {
    this.canUndo.set(this.#historyIndex > 0);
    this.canRedo.set(this.#historyIndex < this.#history.length - 1);
  }

  updateState(updater: (state: FlowState) => void): void {
    const currentState: FlowState = {
      nodes: JSON.parse(JSON.stringify(this.nodes())),
      connections: JSON.parse(JSON.stringify(this.connections())),
    };

    updater(currentState);

    this.nodes.set(currentState.nodes);
    this.connections.set(currentState.connections);

    this.saveStateToHistory();
  }

  onLoaded(): void {
    this.fCanvas()?.resetScaleAndCenter(false);

    if (this.pendingDraft()) {
      const draft = this.pendingDraft()!;
      // Restore state from draft
      this.nodes.set([...draft.nodes]);
      this.connections.set([...draft.connections]);
      this.activeNodeStepKey.set(draft.activeNodeStepKey);
      this.pendingDraft.set(null);
      // Initialize history with restored state
      this.#history = [];
      this.#historyIndex = -1;
      this.saveStateToHistory();
    }
  }

  addConnection(event: FCreateConnectionEvent): void {
    if (!event.fInputId) {
      return;
    }

    this.updateState((state) => {
      state.connections.push({
        id: 'c-' + uuid().slice(0, 6),
        fOutputId: event.fOutputId,
        fInputId: event.fInputId!,
      });
    });
  }

  flows$ = toObservable(this.isWorkspaceOpened).pipe(
    switchMap(() =>
      this.#api.request('get', 'chat-flows/chat-flow').pipe(
        finalize(() => this.isLoading.set(false)),
        map(({ data }) => data)
      )
    )
  );

  flows = toSignal(this.flows$, { initialValue: [] });

  selectedFlow$ = toObservable(this.flowId).pipe(
    filter((id) => !!id),
    switchMap((id) =>
      this.#api
        .request('post', 'chat-flows/chat-flow/show', {
          id: id,
          _method: 'GET',
        })
        .pipe(
          map(({ data }) => data),
          tap((data) => {
            this.flowModel = new flowModel(data);
            // Restore state from loaded data
            this.nodes.set([...data.nodes]);
            this.connections.set([...data.connections]);
            // Initialize history with loaded state
            this.#history = [];
            this.#historyIndex = -1;
            this.saveStateToHistory();
          })
        )
    )
  );

  selectedFlow = toSignal(this.selectedFlow$, { initialValue: [] });

  openWorkspace(flowId?: number) {
    this.isWorkspaceOpened.set(true);
    this.flowId.set(flowId);

    this.workspaceDraft = localStorageSignal<ChatFlowWorkspaceDraft | null>(
      null,
      this.getWorkspaceKey(flowId)
    );

    const draft = this.workspaceDraft();
    if (draft) {
      this.pendingDraft.set(draft);
    }
  }

  Templatefields: FormlyFieldConfig[] = [
    {
      key: 'name',
      type: 'input-field',
      props: { label: _('name'), required: true },
    },
    {
      key: 'message_type',
      type: 'select-field',
      props: {
        label: _('message_type'),
        required: true,
        filter: true,
        options: this.templateList$.pipe(
          map((res: any) =>
            res['message_types'].map((type: any) => ({
              label: type[`label_${this.#currentLang()}`],
              value: type.value,
            }))
          )
        ),
      },
    },
    {
      key: 'interactive_type',
      type: 'select-field',
      hideExpression: () => this.templateModel?.message_type !== 'interactive',
      props: {
        label: _('interactive_type'),
        filter: true,
        required: true,
        options: [],
      },
      expressions: {
        'props.options': () => {
          if (!this.templateModel.message_type) {
            return [];
          }
          return this.#globalList
            .getGlobalList('chat-flows', {
              message_types: 'interactive',
            })
            .pipe(
              map((res: any) =>
                res['interactive_types'].map((type: any) => ({
                  label: type[`label_${this.#currentLang()}`],
                  value: type.value,
                }))
              )
            );
        },
      },
      hooks: {
        onInit: (field) => {
          field.formControl?.valueChanges.subscribe(() => {
            if (this.templateModel.message_type !== 'interactive') {
              field.formControl?.reset(null, { emitEvent: false });
            }
          });
        },
      },
    },
    {
      key: 'message_content',
      type: 'textarea-field',
      props: { label: _('message_content'), required: true },
    },
    {
      key: 'is_active',
      type: 'switch-field',
      props: {
        label: _('is_active'),
      },
    },
    {
      key: 'options',
      type: 'order-list-field',
      hideExpression: () => !this.templateModel?.interactive_type,
      props: {
        label: _('response_options'),
        description: _('drag_to_reorder_configure_buttons'),
        itemLabel: _('option'),
        addBtnText: _('add_option'),
      },
      expressions: {
        'props.maxItems': () =>
          this.templateModel?.interactive_type === 'button' ? 3 : 10,
      },
      fieldArray: {
        fieldGroup: [
          {
            key: 'title',
            type: 'input-field',
            props: { label: _('title'), required: true },
          },
          {
            key: 'action_type',
            type: 'select-field',
            props: {
              label: _('action_type'),
              filter: true,
              required: true,
              options: this.templateList$.pipe(
                map((res: any) =>
                  res['action_types'].map((type: any) => ({
                    label: type[`label_${this.#currentLang()}`],
                    value: type.value,
                  }))
                )
              ),
            },
          },
          {
            key: 'target_step_key',
            type: 'select-field',
            hideExpression: (field) => field?.action_type !== 'jump_to_step',
            props: {
              label: _('next_template'),
              filter: true,
              showClear: true,
              options: [],
            },
            expressions: {
              'props.options': () => {
                return this.nodes()
                  .filter((n) => n.step_key !== this.selectedNode()?.step_key)
                  .map((node) => ({
                    label: node.data.name || node.name,
                    value: node.step_key,
                  }));
              },
            },
          },
          {
            key: 'target_group_id',
            type: 'select-field',
            hideExpression: (field) => field?.action_type !== 'assign_to_group',
            props: {
              label: _('group'),
              filter: true,
              required: true,
              showClear: true,
              options: [],
            },
            expressions: {
              'props.options': (field) => {
                if (field?.model?.action_type !== 'assign_to_group') {
                  return [];
                }
                return this.#globalList
                  .getGlobalList('chat-flows', {
                    action_types: 'assign_to_group',
                  })
                  .pipe(
                    map((res: any) =>
                      res['groups'].map((group: any) => ({
                        label: group.label,
                        value: group.value,
                      }))
                    )
                  );
              },
            },
            hooks: {
              onInit: (field) => {
                field.formControl?.valueChanges.subscribe(() => {
                  if (field?.model?.action_type !== 'assign_to_group') {
                    field.formControl?.reset(null, {
                      emitEvent: false,
                    });
                  }
                });
              },
            },
          },
          {
            key: 'target_user',
            type: 'autocomplete-field',
            hideExpression: (field) => field?.action_type !== 'assign_to_user',
            props: {
              placeholder: _('target_user'),
              endpoint: `auth/users/autocomplete`,
              required: true,
              fieldKey: 'target_user_id',
            },
          },
          { key: 'target_user_id' },
        ],
      },
    },
  ];

  flowFields: FormlyFieldConfig[] = [
    {
      key: 'name',
      type: 'input-field',
      props: {
        label: _('name'),
        required: true,
      },
    },
    {
      key: 'description',
      type: 'textarea-field',
      props: {
        label: _('description'),
        rows: 3,
      },
    },
    this.#fieldBuilder.fieldBuilder([
      {
        key: 'is_active',
        type: 'switch-field',
        props: {
          label: _('is_active'),
        },
      },
      {
        key: 'is_default',
        type: 'switch-field',
        props: {
          label: _('is_default'),
        },
      },
    ]),
  ];

  isNodeActive(stepKey: string): boolean {
    return this.activeNodeStepKey() === stepKey;
  }

  onNodePositionChange(event: any, stepKey: any) {
    // Update visual position immediately for smooth dragging
    this.nodes.update((nodes) =>
      nodes.map((node) =>
        node.step_key === stepKey ? { ...node, x: event.x, y: event.y } : node
      )
    );

    // Store pending position change for history
    this.#pendingPositionChanges.set(stepKey, { x: event.x, y: event.y });

    // Debounce position changes to avoid too many history entries
    if (this.#positionChangeTimeout) {
      clearTimeout(this.#positionChangeTimeout);
    }

    this.#positionChangeTimeout = setTimeout(() => {
      if (this.#pendingPositionChanges.size > 0) {
        // Save current state to history before applying batched position changes
        this.saveStateToHistory();
        this.#pendingPositionChanges.clear();
      }
      this.#positionChangeTimeout = null;
    }, 500);
  }

  getVisibleViewportCenter(): { x: number; y: number } {
    const canvas = this.fCanvas();
    if (!canvas) {
      return { x: 150, y: 150 };
    }

    const canvasElement = canvas.hostElement;
    const rect = canvasElement.getBoundingClientRect();

    const transform = canvas.transform;
    const scale = transform.scale || 1;
    const position = transform.position || { x: 0, y: 0 };

    const viewportCenterX = rect.width / 2;
    const viewportCenterY = rect.height / 2;

    // Convert screen coordinates to canvas coordinates
    const canvasX = (viewportCenterX - position.x) / scale;
    const canvasY = (viewportCenterY - position.y) / scale;

    return { x: canvasX, y: canvasY };
  }

  getNewNodePosition(): { x: number; y: number } {
    const center = this.getVisibleViewportCenter();

    // Add small random offset (±50px) to prevent exact overlap
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 100;

    return {
      x: center.x + offsetX,
      y: center.y + offsetY,
    };
  }

  addNode() {
    const position = this.getNewNodePosition();

    const newNode: FlowNode = {
      step_key: 'n-' + uuid().slice(0, 6),
      name: `Template ${this.nodes().length + 1}`,
      x: position.x,
      y: position.y,
      data: new TemplateModel({
        name: '',
        message_content: '',
        order: this.nodes().length + 1,
        is_active: true,
        options: [],
      }),
    };
    this.newNode.set(newNode);

    this.updateState((state) => {
      state.nodes.push(newNode);
    });

    this.openEditor(newNode);
  }

  onConnectionMouseEnter(connectionId: string) {
    this.hoveredConnection.set(connectionId);
  }

  onConnectionMouseLeave(connectionId: string) {
    if (this.hoveredConnection() === connectionId) {
      this.hoveredConnection.set(null);
    }
  }

  onNodeMouseEnter(stepKey: string) {
    this.hoveredNode.set(stepKey);
  }

  onNodeMouseLeave(stepKey: string) {
    if (this.hoveredNode() === stepKey) {
      this.hoveredNode.set(null);
    }
  }

  addNodeConnectedTo(sourceNode: FlowNode) {
    const newNode: FlowNode = {
      step_key: 'n-' + uuid().slice(0, 6),
      name: `Template ${this.nodes().length + 1}`,
      x: sourceNode.x + 250,
      y: sourceNode.y,
      data: new TemplateModel({
        name: '',
        message_content: '',
        order: this.nodes().length + 1,
        is_active: true,
        options: [],
      }),
    };

    this.newNode.set(newNode);

    this.updateState((state) => {
      state.nodes.push(newNode);
      state.connections.push({
        id: 'c-' + uuid().slice(0, 6),
        fOutputId: sourceNode.step_key,
        fInputId: newNode.step_key,
      });
    });

    this.openEditor(newNode);
  }

  deleteNode(node: FlowNode) {
    this.#confirmService.confirmDelete({
      message: this.#translate.instant('please_confirm_to_delete_template'),
      acceptCallback: () => {
        const deletedStepKey = node.step_key;

        this.updateState((state) => {
          state.nodes = state.nodes.filter(
            (n) => n.step_key !== deletedStepKey
          );

          state.connections = state.connections.filter(
            (c) =>
              c.fOutputId !== deletedStepKey && c.fInputId !== deletedStepKey
          );

          state.nodes = state.nodes.map((n) => ({
            ...n,
            data: {
              ...n.data,
              options:
                n.data.options?.map((opt) => ({
                  ...opt,
                  target_step_key:
                    opt.target_step_key === deletedStepKey
                      ? null
                      : opt.target_step_key,
                })) ?? [],
            },
          }));
        });

        if (this.selectedNode()?.step_key === deletedStepKey) {
          this.closeEditor();
        }

        if (this.activeNodeStepKey() === deletedStepKey) {
          this.activeNodeStepKey.set(null);
        }
      },
    });
  }

  openEditor(node: FlowNode) {
    this.templateForm.reset();
    this.selectedNode.set(node);
    this.templateModel = new TemplateModel(
      JSON.parse(JSON.stringify(node.data))
    );
    this.activeNodeStepKey.set(node.step_key);
  }

  getNodePreview(node: FlowNode) {
    if (this.selectedNode()?.step_key === node.step_key) {
      return this.templateModel;
    }
    return node.data;
  }

  getPreviewOptions(options?: TemplateOption[]): TemplateOption[] {
    if (!Array.isArray(options)) return [];

    return options.filter(
      (option) =>
        !!option &&
        (!!option.title ||
          !!option.target_step_key ||
          !!option.action_type ||
          !!option.target_group_id ||
          !!option.target_user_id)
    );
  }

  saveNode() {
    if (!this.selectedNode()) return;
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      return;
    }

    const sourceNode = this.selectedNode()!;
    const updatedNode: FlowNode = {
      ...sourceNode,
      data: this.templateModel,
    };

    // Update connections based on target_step_key values in options
    const sourceStepKey = updatedNode.step_key;

    // Get all valid target_step_key values from options
    const targetStepKeys = (updatedNode.data.options || [])
      .map((option) => option?.target_step_key)
      .filter((key): key is string => !!key && typeof key === 'string');

    this.updateState((state) => {
      // Update the node
      const nodeIndex = state.nodes.findIndex(
        (n) => n.step_key === updatedNode.step_key
      );
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex] = { ...updatedNode };
      }

      // Remove all existing connections from this source node
      state.connections = state.connections.filter(
        (c) => c.fOutputId !== sourceStepKey
      );

      // Create new connections for each target_step_key
      targetStepKeys.forEach((targetStepKey) => {
        // Check if target node exists
        const targetNode = state.nodes.find(
          (n) => n.step_key === targetStepKey
        );
        if (!targetNode) return;

        // Check if connection already exists (shouldn't happen after removal, but safety check)
        const connectionExists = state.connections.some(
          (c) => c.fOutputId === sourceStepKey && c.fInputId === targetStepKey
        );

        if (!connectionExists) {
          state.connections.push({
            id: 'c-' + uuid().slice(0, 6),
            fOutputId: sourceStepKey,
            fInputId: targetStepKey,
          });
        }
      });
    });

    this.closeEditor();
  }

  openFlowDialog() {
    this.templatevisible.set(true);
  }

  saveFlow() {
    if (this.flowForm.invalid) {
      this.flowForm.markAllAsTouched();
      return;
    }
    this.isFlowLoading.set(true);

    const flowData = {
      ...this.flowModel,
      nodes: this.nodes().map((node) => ({
        step_key: node.step_key,
        name: node.data.name,
        x: node.x,
        y: node.y,
        data: node.data,
      })),
      connections: this.connections().map((connection) => ({
        id: connection.id,
        fOutputId: connection.fOutputId,
        fInputId: connection.fInputId,
      })),
    };

    const endpoint = this.flowId()
      ? 'chat-flows/chat-flow/update'
      : 'chat-flows/chat-flow';
    const method = this.flowId() ? 'put' : 'post';

    this.#api
      .request(method, endpoint, flowData)
      .pipe(
        finalize(() => this.isFlowLoading.set(false)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((res) => {
        this.workspaceDraft.set(null);
        this.templatevisible.set(false);
        this.isWorkspaceOpened.set(false);
      });
  }

  clearWorkspace() {
    this.#confirmService.confirmDelete({
      message: this.#translate.instant(_('please_confirm_to_clear_workspace')),
      acceptCallback: () => {
        this.closeEditor();
        this.updateState((state) => {
          state.nodes = [];
          state.connections = [];
        });
      },
    });
  }

  closeEditor() {
    this.selectedNode.set(null);
  }

  getNextNodeName(nextNodeStepKey: string | null | undefined): string {
    if (!nextNodeStepKey) return 'Template';

    const nextNode = this.nodes().find((n) => n.step_key === nextNodeStepKey);
    return nextNode?.data.name || 'Template';
  }

  getWorkspaceKey(flowId?: number) {
    return flowId ? `CHAT_FLOW_WORKSPACE_${flowId}` : `CHAT_FLOW_WORKSPACE_NEW`;
  }

  workspaceDraft$ = combineLatest([
    toObservable(this.nodes),
    toObservable(this.connections),
    toObservable(this.activeNodeStepKey),
  ])
    .pipe(takeUntilDestroyed(this.#destroyRef))
    .subscribe(() => {
      if (!this.isWorkspaceOpened()) return;

      this.workspaceDraft.set({
        flowId: this.flowId(),
        nodes: this.nodes(),
        connections: this.connections(),
        activeNodeStepKey: this.activeNodeStepKey(),
      });
    });

  openConnectMenu(event: MouseEvent, node: FlowNode, optionIndex: number) {
    event.preventDefault();
    event.stopPropagation();

    this.connectingNode.set(node);
    this.connectingOptionIndex.set(optionIndex);

    this.connectMenuItems.set(this.buildConnectMenuItems(node, optionIndex));

    this.connectMenu()?.show(event);
  }

  buildConnectMenuItems(node: FlowNode, optionIndex: number): MenuItem[] {
    const items: MenuItem[] = [];

    // Existing templates
    this.nodes()
      .filter((n) => n.step_key !== node.step_key)
      .forEach((targetNode) => {
        items.push({
          label: targetNode.data.name || targetNode.name,
          icon: 'pi pi-sitemap',
          command: () => {
            this.connectOptionToNode(node, optionIndex, targetNode);
          },
        });
      });

    items.push({ separator: true });

    // Add new template
    items.push({
      label: this.#translate.instant('add_new_template'),
      icon: 'pi pi-plus',
      command: () => {
        this.createNodeAndConnect(node, optionIndex);
      },
    });

    return items;
  }

  connectOptionToNode(
    sourceNode: FlowNode,
    optionIndex: number,
    targetNode: FlowNode
  ) {
    this.updateState((state) => {
      // Find and update the source node
      const nodeIndex = state.nodes.findIndex(
        (n) => n.step_key === sourceNode.step_key
      );
      if (nodeIndex !== -1) {
        const updatedNode = { ...state.nodes[nodeIndex] };
        if (!updatedNode.data.options) {
          updatedNode.data.options = [];
        }
        updatedNode.data.options = [...updatedNode.data.options];
        updatedNode.data.options[optionIndex] = {
          ...updatedNode.data.options[optionIndex],
          target_step_key: targetNode.step_key,
        };
        state.nodes[nodeIndex] = updatedNode;
      }

      // Create visual connection
      state.connections.push({
        id: 'c-' + uuid().slice(0, 6),
        fOutputId: sourceNode.step_key,
        fInputId: targetNode.step_key,
      });
    });
  }

  createNodeAndConnect(sourceNode: FlowNode, optionIndex: number) {
    this.addNode();
    this.connectOptionToNode(sourceNode, optionIndex, this.newNode());
  }

  getConnectionLabel(connection: FlowConnection): string {
    if (!connection?.fOutputId || !connection?.fInputId) {
      return 'Connect';
    }

    const sourceNode = this.nodes().find(
      (n) => n.step_key === connection.fOutputId
    );

    if (!sourceNode?.data?.options?.length) {
      return 'Connect';
    }

    const optionTitles = sourceNode.data.options
      .filter(
        (option) =>
          option?.target_step_key === connection.fInputId && option?.title
      )
      .map((option) => option.title!.trim())
      .filter(Boolean);

    if (optionTitles.length) {
      return optionTitles.join(', ');
    }

    return 'Connect';
  }

  onConnectionClick(event: MouseEvent, connection: FlowConnection) {
    event.preventDefault();
    event.stopPropagation();

    this.selectedConnection.set(connection);

    const sourceNode = this.nodes().find(
      (n) => n.step_key === connection.fOutputId
    );

    if (!sourceNode) return;

    // options-based connections
    let options = (sourceNode.data.options || [])
      .map((option, index) => ({
        optionIndex: index,
        optionTitle: option?.title || `Option ${index + 1}`,
        targetStepKey: option?.target_step_key,
        isFallback: false,
      }))
      .filter(
        (opt) =>
          opt.targetStepKey === connection.fInputId &&
          typeof opt.targetStepKey === 'string'
      );

    // fallback: no options but connection exists
    if (!options.length) {
      const targetNode = this.nodes().find(
        (n) => n.step_key === connection.fInputId
      );

      if (targetNode) {
        options = [
          {
            optionIndex: -1,
            optionTitle: targetNode.data.name || targetNode.name,
            targetStepKey: targetNode.step_key,
            isFallback: true,
          },
        ];
      }
    }

    this.connectionMenuOptions.set(options as ConnectionMenuOption[]);

    this.connectionMenuPosition.set({
      x: event.clientX,
      y: event.clientY,
    });

    this.connectionMenuVisible.set(true);
  }

  deleteConnectionWith(optionIndex: number) {
    const connection = this.selectedConnection();
    if (!connection) return;

    // fallback: delete entire connection
    if (optionIndex === -1) {
      this.updateState((state) => {
        state.connections = state.connections.filter(
          (c) => c.id !== connection.id
        );
      });

      this.closeConnectionMenu();
      return;
    }

    // normal option-based delete
    this.updateState((state) => {
      const sourceNodeIndex = state.nodes.findIndex(
        (n) => n.step_key === connection.fOutputId
      );

      if (sourceNodeIndex === -1) return;

      const updatedNode = { ...state.nodes[sourceNodeIndex] };
      const option = updatedNode.data.options?.[optionIndex];
      if (!option?.target_step_key) return;

      const targetStepKey = option.target_step_key;

      updatedNode.data.options = [...updatedNode.data.options];
      updatedNode.data.options[optionIndex] = {
        ...option,
        target_step_key: null,
      };

      state.nodes[sourceNodeIndex] = updatedNode;

      const stillUsed = updatedNode.data.options.some(
        (opt, i) => i !== optionIndex && opt?.target_step_key === targetStepKey
      );

      if (!stillUsed) {
        state.connections = state.connections.filter(
          (c) =>
            !(
              c.fOutputId === connection.fOutputId &&
              c.fInputId === targetStepKey
            )
        );
      }
    });

    this.closeConnectionMenu();
  }

  deleteAllConnections() {
    const connection = this.selectedConnection();
    if (!connection) return;

    const targetStepKey = connection.fInputId;
    const sourceKey = connection.fOutputId;

    this.updateState((state) => {
      // Find source node
      const sourceNodeIndex = state.nodes.findIndex(
        (n) => n.step_key === sourceKey
      );

      if (sourceNodeIndex === -1) return;

      const updatedNode = { ...state.nodes[sourceNodeIndex] };

      if (!updatedNode.data.options) return;

      // Remove target_step_key from all options that point to this target
      updatedNode.data.options = updatedNode.data.options.map((opt) => ({
        ...opt,
        target_step_key:
          opt?.target_step_key === targetStepKey ? null : opt?.target_step_key,
      }));

      state.nodes[sourceNodeIndex] = updatedNode;

      // Remove the connection
      state.connections = state.connections.filter(
        (c) => !(c.fOutputId === sourceKey && c.fInputId === targetStepKey)
      );
    });

    this.closeConnectionMenu();
  }

  closeConnectionMenu() {
    this.connectionMenuVisible.set(false);
    this.selectedConnection.set(null);
    this.connectionMenuOptions.set([]);
  }

  undo(): void {
    if (this.#historyIndex > 0) {
      this.#historyIndex--;
      const state = this.#history[this.#historyIndex];
      this.restoreStateFromHistory(state);
      this.updateUndoRedoState();
    }
  }

  redo(): void {
    if (this.#historyIndex < this.#history.length - 1) {
      this.#historyIndex++;
      const state = this.#history[this.#historyIndex];
      this.restoreStateFromHistory(state);
      this.updateUndoRedoState();
    }
  }
}
