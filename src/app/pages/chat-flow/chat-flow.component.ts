import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EFConnectionBehavior, EFMarkerType, FFlowModule } from '@foblex/flow';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { _, TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { filter, finalize, map, switchMap, tap } from 'rxjs';
import { FieldBuilderService } from 'src/app/shared/services/field-builder.service';
import { GlobalListService } from 'src/app/shared/services/global-list.service';
import { ApiService } from 'src/app/shared/services/global-services/api.service';
import { LangService } from 'src/app/shared/services/lang.service';
import { v4 as uuid } from 'uuid';
import { flowModel, TemplateModel } from './services/service-type';

interface FlowNode {
  step_key: string;
  name: string;
  x: number;
  y: number;
  data: TemplateModel;
}

interface FlowConnection {
  id: string;
  source: string;
  target: string;
  optionIndex?: number;
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

  templateList$ = this.#globalList.getGlobalList('chat-flows');

  flowId = signal<number | undefined>(undefined);
  activeNodeStepKey = signal<string | null>(null);
  connections = signal<FlowConnection[]>([]);
  selectedNode = signal<FlowNode | null>(null);
  connectionSource = signal<FlowNode | null>(null);
  connectionTarget = signal<FlowNode | null>(null);
  isDraggingConnection = signal(false);
  pointer = signal({ x: 0, y: 0 });
  templatevisible = signal(false);
  loading = signal(false);
  selectedOptionIndex = signal<number | null>(null);
  isFlowLoading = signal(false);
  isLoading = signal(true);
  nodes = signal<FlowNode[]>([]);
  isWorkspaceOpened = signal(false);
  selectedConnection = signal<string | null>(null);
  isConnectionMenuVisible = signal(false);
  connectionMenuPosition = signal({ x: 0, y: 0 });
  hoveredConnection = signal<string | null>(null);
  selectedConnectionOptions = signal<
    Array<{ optionIndex: number; label: string; connectionId: string }>
  >([]);
  showDeleteOptionsMenu = signal(false);

  templateModel: TemplateModel = new TemplateModel();
  flowModel: flowModel = new flowModel();
  templateForm = new FormGroup({});
  flowForm = new FormGroup({});

  eConnectionBehaviour = EFConnectionBehavior;
  readonly eMarkerType = EFMarkerType;

  flows$ = this.#api.request('get', 'chat-flows/chat-flow').pipe(
    finalize(() => this.isLoading.set(false)),
    map(({ data }) => data)
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
            this.nodes.set(data.nodes);
            this.connections.set(data.connections);
          })
        )
    )
  );

  selectedFlow = toSignal(this.selectedFlow$, { initialValue: [] });

  canConnect = computed(
    () => this.connectionSource() && this.connectionTarget()
  );

  // Merge connections with same source and target
  mergedConnections = computed(() => {
    const merged = new Map<
      string,
      FlowConnection & { optionIndices: number[]; connectionIds: string[] }
    >();

    this.connections().forEach((conn) => {
      const key = `${conn.source}-${conn.target}`;

      if (merged.has(key)) {
        const existing = merged.get(key)!;
        if (conn.optionIndex !== undefined) {
          existing.optionIndices.push(conn.optionIndex);
          existing.connectionIds.push(conn.id);
        }
      } else {
        merged.set(key, {
          ...conn,
          optionIndices:
            conn.optionIndex !== undefined ? [conn.optionIndex] : [],
          connectionIds: [conn.id],
        });
      }
    });

    return Array.from(merged.values());
  });

  openWorkspace(flowId?: number) {
    this.isWorkspaceOpened.set(true);
    this.flowId.set(flowId);
  }

  Templatefields: FormlyFieldConfig[] = [
    {
      key: 'name',
      type: 'input-field',
      props: { label: _('name'), required: true },
    },
    {
      key: 'order',
      type: 'input-field',
      props: { label: _('order'), type: 'number' },
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
              required: true,
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
    this.nodes.update((nodes) =>
      nodes.map((node) =>
        node.step_key === stepKey ? { ...node, x: event.x, y: event.y } : node
      )
    );
  }

  addNode() {
    const newNode: FlowNode = {
      step_key: 'n-' + uuid().slice(0, 6),
      name: `Template ${this.nodes().length + 1}`,
      x: 150 + Math.random() * 200,
      y: 150 + Math.random() * 200,
      data: new TemplateModel({
        name: '',
        message_content: '',
        order: this.nodes().length + 1,
        is_active: true,
        options: [],
      }),
    };
    this.nodes.update((nodes) => [...nodes, newNode]);

    this.openEditor(newNode);
  }

  startConnectionFromOption(
    node: FlowNode,
    optionIndex: number,
    event: MouseEvent
  ) {
    event.stopPropagation();

    this.activeNodeStepKey.set(node.step_key);
    this.connectionSource.set(node);
    this.selectedOptionIndex.set(optionIndex);
    this.isDraggingConnection.set(true);
  }

  selectNodeForConnection(node: FlowNode, event: MouseEvent) {
    event.stopPropagation();
    this.activeNodeStepKey.set(node.step_key);
    const source = this.connectionSource();

    // Ensure source still exists in nodes
    if (source && !this.nodes().some((n) => n.step_key === source.step_key)) {
      this.cancelConnection();
      return;
    }

    if (
      this.isDraggingConnection() &&
      source &&
      source.step_key !== node.step_key
    ) {
      this.connectionTarget.set(node);
      this.createConnection();
      return;
    }

    if (!node.data.options || node.data.options.length === 0) {
      this.connectionSource.set(node);
      this.selectedOptionIndex.set(null);
      this.isDraggingConnection.set(true);
      return;
    }

    const firstEmptyOption = node.data.options.findIndex(
      (opt) => !opt.target_step_key
    );

    if (firstEmptyOption === -1) {
      console.warn('All options already have connections');
      return;
    }

    this.connectionSource.set(node);
    this.selectedOptionIndex.set(firstEmptyOption);
    this.isDraggingConnection.set(true);
  }

  cancelConnection() {
    this.connectionSource.set(null);
    this.connectionTarget.set(null);
    this.activeNodeStepKey.set(null);
    this.selectedNode.set(null);
    this.selectedOptionIndex.set(null);
    this.isDraggingConnection.set(false);
  }

  createConnection() {
    if (!this.canConnect()) return;

    const sourceNode = this.connectionSource()!;
    const targetNode = this.connectionTarget()!;
    const optionIndex = this.selectedOptionIndex();

    // Check for duplicate connection
    const isDuplicate = this.connections().some(
      (c) =>
        c.source === sourceNode.step_key &&
        c.target === targetNode.step_key &&
        c.optionIndex === optionIndex
    );

    if (isDuplicate) {
      console.warn('Connection already exists');
      this.cancelConnection();
      return;
    }

    if (optionIndex === null) {
      this.connections.set([
        ...this.connections(),
        {
          id: 'c-' + uuid().slice(0, 6),
          source: sourceNode.step_key,
          target: targetNode.step_key,
          optionIndex: undefined,
        },
      ]);

      this.cancelConnection();
      return;
    }

    if (optionIndex < 0 || optionIndex >= sourceNode.data.options.length) {
      console.error('Invalid option index');
      this.cancelConnection();
      return;
    }

    const updatedOptions = [...sourceNode.data.options];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      target_step_key: targetNode.step_key,
    };

    const updatedSourceNode = {
      ...sourceNode,
      data: { ...sourceNode.data, options: updatedOptions },
    };

    this.nodes.set(
      this.nodes().map((n) =>
        n.step_key === sourceNode.step_key ? updatedSourceNode : n
      )
    );

    this.connections.set([
      ...this.connections(),
      {
        id: 'c-' + uuid().slice(0, 6),
        source: sourceNode.step_key,
        target: targetNode.step_key,
        optionIndex,
      },
    ]);

    this.cancelConnection();
  }

  deleteNode(node: FlowNode) {
    // Remove target_step_key references from other nodes' options
    const updatedNodes = this.nodes().map((n) => {
      if (n.step_key === node.step_key) return n;

      const hasReferences = n.data.options?.some(
        (opt) => opt.target_step_key === node.step_key
      );

      if (hasReferences) {
        return {
          ...n,
          data: {
            ...n.data,
            options: n.data.options.map((opt) =>
              opt.target_step_key === node.step_key
                ? { ...opt, target_step_key: null }
                : opt
            ),
          },
        };
      }

      return n;
    });

    this.nodes.set(updatedNodes.filter((n) => n.step_key !== node.step_key));

    this.connections.set(
      this.connections().filter(
        (c) => c.source !== node.step_key && c.target !== node.step_key
      )
    );

    if (this.activeNodeStepKey() === node.step_key) {
      this.activeNodeStepKey.set(null);
    }
    if (this.selectedNode()?.step_key === node.step_key) {
      this.selectedNode.set(null);
    }
  }

  deleteSingleOptionConnection(connectionId: string) {
    const connection = this.connections().find((c) => c.id === connectionId);
    if (!connection) return;

    if (connection.optionIndex !== undefined) {
      this.clearOptionTarget(connection.source, connection.optionIndex);
    }

    this.connections.set(
      this.connections().filter((c) => c.id !== connectionId)
    );

    this.closeConnectionMenu();
  }

  deleteAllConnections(source: string, target: string) {
    const connectionsToRemove = this.connections().filter(
      (c) => c.source === source && c.target === target
    );

    connectionsToRemove.forEach((conn) => {
      if (conn.optionIndex !== undefined) {
        this.clearOptionTarget(conn.source, conn.optionIndex);
      }
    });

    this.connections.set(
      this.connections().filter(
        (c) => !(c.source === source && c.target === target)
      )
    );

    this.closeConnectionMenu();
  }

  clearOptionTarget(sourceStepKey: string, optionIndex: number) {
    const sourceNode = this.nodes().find((n) => n.step_key === sourceStepKey);
    if (!sourceNode || !sourceNode.data.options?.[optionIndex]) return;

    const updatedOptions = [...sourceNode.data.options];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      target_step_key: null,
    };

    this.nodes.set(
      this.nodes().map((n) =>
        n.step_key === sourceStepKey
          ? { ...n, data: { ...n.data, options: updatedOptions } }
          : n
      )
    );
  }

  onConnectionMouseEnter(connectionId: string) {
    this.hoveredConnection.set(connectionId);
  }

  onConnectionMouseLeave(connectionId: string) {
    if (this.hoveredConnection() === connectionId) {
      this.hoveredConnection.set(null);
    }
  }
  selectedConnectionGroup = signal<{
    source: string;
    target: string;
  } | null>(null);

  onConnectionClick(
    connection: FlowConnection & {
      optionIndices?: number[];
      connectionIds?: string[];
    },
    event: MouseEvent
  ) {
    event.stopPropagation();

    const labels = this.getConnectionLabels(connection);

    if (labels.length === 1) {
      this.selectedConnection.set(labels[0].connectionId);
      this.isConnectionMenuVisible.set(true);
      this.showDeleteOptionsMenu.set(false);
    } else {
      this.selectedConnectionOptions.set(labels);
      this.selectedConnectionGroup.set({
        source: connection.source,
        target: connection.target,
      });

      this.showDeleteOptionsMenu.set(true);
    }

    this.connectionMenuPosition.set({
      x: event.clientX,
      y: event.clientY,
    });
  }

  selectConnectionToDelete(connectionId: string) {
    this.showDeleteOptionsMenu.set(false);
    this.selectedConnection.set(connectionId);
    this.isConnectionMenuVisible.set(true);
  }

  closeConnectionMenu() {
    this.isConnectionMenuVisible.set(false);
    this.showDeleteOptionsMenu.set(false);
    this.selectedConnection.set(null);
    this.selectedConnectionOptions.set([]);
  }

  getConnectionLabel(
    connection: FlowConnection & {
      optionIndices?: number[];
    }
  ): string {
    const indices =
      connection.optionIndices ??
      (connection.optionIndex !== undefined ? [connection.optionIndex] : []);

    if (!indices.length) {
      return 'Connection';
    }

    const sourceNode = this.nodes().find(
      (n) => n.step_key === connection.source
    );

    if (!sourceNode?.data?.options) {
      return indices.map((i) => `Option ${i + 1}`).join(', ');
    }
    console.log(indices);
    return indices
      .map((i) => sourceNode.data.options[i]?.title || `Option ${i + 1}`)
      .join(', ');
  }

  getConnectionMidpoint(connection: FlowConnection): { x: number; y: number } {
    const source = this.nodes().find((n) => n.step_key === connection.source);
    const target = this.nodes().find((n) => n.step_key === connection.target);

    if (!source || !target) {
      return { x: 0, y: 0 };
    }

    const NODE_WIDTH = 220;
    const NODE_HEIGHT = 90;

    return {
      x: (source.x + NODE_WIDTH + target.x) / 2,
      y: (source.y + NODE_HEIGHT / 2 + target.y + NODE_HEIGHT / 2) / 2,
    };
  }

  getConnectionLabels(
    connection: FlowConnection & {
      optionIndices?: number[];
      connectionIds?: string[];
    }
  ): Array<{ label: string; optionIndex: number; connectionId: string }> {
    const optionIndices =
      connection.optionIndices ||
      (connection.optionIndex !== undefined ? [connection.optionIndex] : []);
    const connectionIds = connection.connectionIds || [connection.id];

    if (optionIndices.length === 0) {
      return [
        { label: 'Connection', optionIndex: -1, connectionId: connection.id },
      ];
    }

    const sourceNode = this.nodes().find(
      (n) => n.step_key === connection.source
    );
    if (!sourceNode || !sourceNode.data.options) {
      return optionIndices.map((i, idx) => ({
        label: `Option ${i + 1}`,
        optionIndex: i,
        connectionId: connectionIds[idx] || connection.id,
      }));
    }

    return optionIndices.map((index, idx) => {
      const option = sourceNode.data.options[index];
      return {
        label: option?.title || `Option ${index + 1}`,
        optionIndex: index,
        connectionId: connectionIds[idx] || connection.id,
      };
    });
  }

  openEditor(node: FlowNode) {
    this.templateForm.reset();
    this.selectedNode.set(node);
    this.templateModel = new TemplateModel(node.data);
    this.templateForm.patchValue(this.templateModel);
    this.activeNodeStepKey.set(node.step_key);
  }

  saveNode() {
    if (!this.selectedNode()) return;
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      return;
    }

    const updatedNode: FlowNode = {
      ...this.selectedNode()!,
      data: this.templateModel,
    };

    const options = this.templateModel.options || [];

    // Update connections based on target_step_key changes
    const updatedConnections = this.connections().filter((c) => {
      if (c.source !== updatedNode.step_key) return true;
      if (c.optionIndex !== undefined && c.optionIndex < options.length) {
        return options[c.optionIndex].target_step_key === c.target;
      }
      return false;
    });

    options.forEach((option, index) => {
      if (option.target_step_key) {
        const existingConnection = updatedConnections.find(
          (c) =>
            c.source === updatedNode.step_key &&
            c.optionIndex === index &&
            c.target === option.target_step_key
        );

        if (!existingConnection) {
          updatedConnections.push({
            id: 'c-' + uuid().slice(0, 6),
            source: updatedNode.step_key,
            target: option.target_step_key,
            optionIndex: index,
          });
        }
      }
    });

    this.connections.set(updatedConnections);

    this.nodes.set(
      this.nodes().map((n) =>
        n.step_key === updatedNode.step_key ? updatedNode : n
      )
    );

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
        name: node.name,
        x: node.x,
        y: node.y,
        data: node.data,
      })),
      connections: this.connections().map((conn) => ({
        id: conn.id,
        source: conn.source,
        target: conn.target,
        optionIndex: conn.optionIndex,
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
        this.templatevisible.set(false);
      });
  }

  closeEditor() {
    this.cancelConnection();
  }

  getNextNodeName(nextNodeStepKey: string | null | undefined): string {
    if (!nextNodeStepKey) return 'Template';

    const nextNode = this.nodes().find((n) => n.step_key === nextNodeStepKey);
    return nextNode?.data.name || 'Template';
  }
}
