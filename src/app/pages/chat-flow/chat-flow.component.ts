import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FFlowModule } from '@foblex/flow';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { _, TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { map } from 'rxjs';
import { GlobalListService } from 'src/app/shared/services/global-list.service';
import { LangService } from 'src/app/shared/services/lang.service';
import { v4 as uuid } from 'uuid';
import { TemplateModel } from './services/service-type';

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
  ],
  templateUrl: './chat-flow.component.html',
  styleUrls: ['./chat-flow.component.scss'],
})
export class ChatFlowComponent {
  #globalList = inject(GlobalListService);
  #currentLang = inject(LangService).currentLanguage;

  templateList$ = this.#globalList.getGlobalList('routing');

  activeNodeStepKey = signal<string | null>(null);
  connections = signal<FlowConnection[]>([]);
  selectedNode = signal<FlowNode | null>(null);
  connectionSource = signal<FlowNode | null>(null);
  connectionTarget = signal<FlowNode | null>(null);
  isDraggingConnection = signal(false);
  pointer = signal({ x: 0, y: 0 });
  loading = signal(false);
  model: any;
  templateForm = new FormGroup({});

  // ⭐ Track which option is being connected
  selectedOptionIndex = signal<number | null>(null);

  nodes = signal<FlowNode[]>([
    {
      step_key: 'n1',
      name: 'Department Selection',
      x: 40,
      y: 40,
      data: {
        name: 'Department Selection',
        message_text: '👋 Welcome to 8X CRM!',
        level_type: 'department',
        parent_department_id: 1,
        order: 1,
        is_active: true,
        options: [
          {
            title: 'Sales',
            department_id: 1,
            subrole_id: null,
            order: 1,
            is_active: true,
            next_node_id: null,
          },
          {
            title: 'Support',
            department_id: 2,
            subrole_id: null,
            order: 2,
            is_active: true,
            next_node_id: null,
          },
          {
            title: 'Marketing',
            department_id: 3,
            subrole_id: null,
            order: 3,
            is_active: true,
            next_node_id: null,
          },
        ],
      },
    },
  ]);

  canConnect = computed(
    () => this.connectionSource() && this.connectionTarget()
  );

  fields: FormlyFieldConfig[] = [
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
      key: 'level_type',
      type: 'select-field',
      props: {
        label: _('level_type'),
        filter: true,
        required: true,
        options: this.templateList$.pipe(
          map((res: any) =>
            res['level-types'].map((type: any) => ({
              label: type.label,
              value: type.value,
            }))
          )
        ),
      },
    },
    {
      key: 'parent_department_id',
      type: 'select-field',
      hideExpression: () => this.model?.level_type !== 'subrole',
      props: {
        label: _('department'),
        filter: true,
        options: this.templateList$.pipe(
          map(({ departments }) =>
            departments.map((department: any) => ({
              label: department[`label_${this.#currentLang()}`],
              value: department.value,
            }))
          )
        ),
      },
    },
    {
      key: 'message_text',
      type: 'textarea-field',
      props: { label: _('message_text'), required: true },
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
      props: {
        label: _('response_options'),
        description: _('drag_to_reorder_configure_buttons'),
        itemLabel: _('option'),
        addBtnText: _('add_option'),
        maxItems: 3,
      },
      fieldArray: {
        fieldGroup: [
          {
            key: 'title',
            type: 'input-field',
            props: { label: _('title') },
          },
          {
            key: 'order',
            type: 'input-field',
            props: { label: _('order'), type: 'number' },
          },
          {
            key: 'department_id',
            type: 'select-field',
            hideExpression: () => this.model?.level_type !== 'department',
            props: {
              label: _('department'),
              filter: true,
              options: this.templateList$.pipe(
                map(({ departments }) =>
                  departments.map((department: any) => ({
                    label: department[`label_${this.#currentLang()}`],
                    value: department.value,
                  }))
                )
              ),
            },
          },
          {
            key: 'subrole_id',
            type: 'select-field',
            hideExpression: () =>
              this.model?.level_type !== 'subrole' ||
              !this.model.parent_department_id,
            props: {
              label: _('subrole'),
              filter: true,
              options: [],
            },
            expressions: {
              'props.options': () => {
                if (!this.model.parent_department_id) {
                  return [];
                }
                return this.#globalList
                  .getGlobalList('routing', {
                    department_id: this.model.parent_department_id,
                  })
                  .pipe(
                    map((res: any) =>
                      res['sub-roles'].map((sub: any) => ({
                        label: sub[`label_${this.#currentLang()}`],
                        value: sub.value,
                      }))
                    )
                  );
              },
            },
            hooks: {
              onInit: (field) => {
                field.formControl?.valueChanges.subscribe(() => {
                  if (!this.model?.parent_department_id) {
                    field.formControl?.reset();
                  }
                });
              },
            },
          },
          {
            key: 'next_node_id',
            type: 'select-field',
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
            key: 'is_active',
            type: 'switch-field',
            props: {
              label: 'is_active',
            },
          },
        ],
      },
    },
  ];

  submit(): void {
    if (this.templateForm.invalid) return;
    this.loading.set(true);
    console.log(this.model);
  }

  isNodeActive(stepKey: string): boolean {
    return this.activeNodeStepKey() === stepKey;
  }

  addNode() {
    const newNode: FlowNode = {
      step_key: 'n-' + uuid().slice(0, 6),
      name: `Template ${this.nodes().length + 1}`,
      x: 150 + Math.random() * 200,
      y: 150 + Math.random() * 200,
      data: new TemplateModel({
        name: '',
        message_text: '',
        level_type: '',
        order: this.nodes().length + 1,
        is_active: true,
        parent_department_id: null,
        options: [],
      }),
    };
    this.openEditor(newNode);
    this.nodes.set([...this.nodes(), newNode]);
  }

  // ⭐ Start connection from specific option
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

  /** Start selecting source node */
  selectNodeForConnection(node: FlowNode, event: MouseEvent) {
    event.stopPropagation();

    this.activeNodeStepKey.set(node.step_key);

    const source = this.connectionSource();

    // Ensure source still exists in nodes
    if (source && !this.nodes().some((n) => n.step_key === source.step_key)) {
      this.cancelConnection();
      return;
    }

    // If we're in connection mode and this is a different node, complete connection
    if (
      this.isDraggingConnection() &&
      source &&
      source.step_key !== node.step_key
    ) {
      this.connectionTarget.set(node);
      this.createConnection();
      return;
    }

    // ⭐ If node has no options, show message
    if (!node.data.options || node.data.options.length === 0) {
      console.warn(
        'This node has no options to connect from. Add options first.'
      );
      return;
    }

    // ⭐ If node has options, user should click on option to connect
    // For now, we'll use the first available option
    const firstEmptyOption = node.data.options.findIndex(
      (opt) => !opt.next_node_id
    );

    if (firstEmptyOption === -1) {
      console.warn('All options already have connections');
      return;
    }

    this.connectionSource.set(node);
    this.selectedOptionIndex.set(firstEmptyOption);
    this.isDraggingConnection.set(true);
  }

  /** Mouse move listens inside canvas */
  onCanvasMouseMove(event: MouseEvent) {
    if (!this.isDraggingConnection()) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.pointer.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  /** Cancel drag if clicked outside */
  cancelConnection() {
    this.connectionSource.set(null);
    this.connectionTarget.set(null);
    this.selectedOptionIndex.set(null);
    this.isDraggingConnection.set(false);
  }

  /** Actually create a connection */
  createConnection() {
    if (!this.canConnect()) return;

    const sourceNode = this.connectionSource()!;
    const targetNode = this.connectionTarget()!;
    const optionIndex = this.selectedOptionIndex();

    // ⭐ Validate option index
    if (
      optionIndex === null ||
      optionIndex < 0 ||
      optionIndex >= sourceNode.data.options.length
    ) {
      console.error('Invalid option index');
      this.cancelConnection();
      return;
    }

    const sourceStepKey = sourceNode.step_key;
    const targetStepKey = targetNode.step_key;

    // ⭐ Update the specific option's next_node_id
    const updatedOptions = [...sourceNode.data.options];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      next_node_id: targetStepKey,
    };

    // ⭐ Update the source node with new options
    const updatedSourceNode: FlowNode = {
      ...sourceNode,
      data: {
        ...sourceNode.data,
        options: updatedOptions,
      },
    };

    // Save updated node
    this.nodes.set(
      this.nodes().map((n) =>
        n.step_key === sourceStepKey ? updatedSourceNode : n
      )
    );

    // ⭐ Create visual connection with option reference
    this.connections.set([
      ...this.connections(),
      {
        id: 'c-' + uuid().slice(0, 6),
        source: sourceStepKey,
        target: targetStepKey,
        optionIndex: optionIndex,
      },
    ]);

    this.cancelConnection();
  }

  /** Delete node + its connections */
  deleteNode(node: FlowNode) {
    // ⭐ Remove next_node_id references from other nodes' options
    const updatedNodes = this.nodes().map((n) => {
      if (n.step_key === node.step_key) return n; // Will be filtered out

      const hasReferences = n.data.options?.some(
        (opt) => opt.next_node_id === node.step_key
      );

      if (hasReferences) {
        return {
          ...n,
          data: {
            ...n.data,
            options: n.data.options.map((opt) =>
              opt.next_node_id === node.step_key
                ? { ...opt, next_node_id: null }
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

  // ⭐ Delete specific connection
  deleteConnection(connectionId: string) {
    const connection = this.connections().find((c) => c.id === connectionId);

    if (connection) {
      // Remove next_node_id from the option
      const sourceNode = this.nodes().find(
        (n) => n.step_key === connection.source
      );

      if (sourceNode && connection.optionIndex !== undefined) {
        const updatedOptions = [...sourceNode.data.options];
        if (updatedOptions[connection.optionIndex]) {
          updatedOptions[connection.optionIndex] = {
            ...updatedOptions[connection.optionIndex],
            next_node_id: null,
          };

          this.nodes.set(
            this.nodes().map((n) =>
              n.step_key === sourceNode.step_key
                ? { ...n, data: { ...n.data, options: updatedOptions } }
                : n
            )
          );
        }
      }
    }

    // Remove visual connection
    this.connections.set(
      this.connections().filter((c) => c.id !== connectionId)
    );
  }

  /** Editor */
  openEditor(node: FlowNode) {
    this.selectedNode.set(node);
    this.model = new TemplateModel(node.data);
    this.templateForm.patchValue(this.model);
    this.activeNodeStepKey.set(node.step_key);
  }

  saveNode() {
    if (!this.selectedNode()) return;
    if (this.templateForm.invalid) return;

    const formValue = this.templateForm.value;
    const updatedData = new TemplateModel(formValue);

    const updatedNode: FlowNode = {
      ...this.selectedNode()!,
      data: updatedData,
    };

    // ⭐ Sync connections with option changes
    const oldOptions = this.selectedNode()!.data.options || [];
    const newOptions = updatedData.options || [];

    // Update connections based on next_node_id changes
    const updatedConnections = this.connections().filter((c) => {
      if (c.source !== updatedNode.step_key) return true;

      // Check if this connection's option still exists and has matching next_node_id
      if (c.optionIndex !== undefined && c.optionIndex < newOptions.length) {
        return newOptions[c.optionIndex].next_node_id === c.target;
      }

      return false;
    });

    // Add new connections for manually set next_node_id
    newOptions.forEach((option, index) => {
      if (option.next_node_id) {
        const existingConnection = updatedConnections.find(
          (c) =>
            c.source === updatedNode.step_key &&
            c.optionIndex === index &&
            c.target === option.next_node_id
        );

        if (!existingConnection) {
          updatedConnections.push({
            id: 'c-' + uuid().slice(0, 6),
            source: updatedNode.step_key,
            target: option.next_node_id,
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

    this.selectedNode.set(null);
  }

  saveFullFlow() {
    // ⭐ Build complete flow structure
    const flowData = {
      nodes: this.nodes().map((node) => ({
        step_key: node.step_key,
        name: node.name,
        position: { x: node.x, y: node.y },
        data: node.data,
      })),
      connections: this.connections().map((conn) => ({
        id: conn.id,
        source: conn.source,
        target: conn.target,
        optionIndex: conn.optionIndex,
      })),
    };

    console.log('COMPLETE FLOW PAYLOAD:', flowData);

    // Call your API here
    // this.apiService.saveFlow(flowData).subscribe(...)
  }

  closeEditor() {
    this.selectedNode.set(null);
  }

  /** Get the name of the next node by its step_key */
  getNextNodeName(nextNodeStepKey: string | null): string {
    if (!nextNodeStepKey) return 'Template'; // fallback if no next_node_id

    const nextNode = this.nodes().find((n) => n.step_key === nextNodeStepKey);
    return nextNode?.data.name || 'Template';
  }

  /** Calculate midpoint for delete button */
  getConnectionMidpoint(
    sourceStepKey: string,
    targetStepKey: string
  ): { x: number; y: number } {
    const source = this.nodes().find((n) => n.step_key === sourceStepKey);
    const target = this.nodes().find((n) => n.step_key === targetStepKey);

    if (!source || !target) return { x: 0, y: 0 };

    return {
      x: (source.x + target.x) / 2 + 100,
      y: (source.y + target.y) / 2 + 40,
    };
  }
}
