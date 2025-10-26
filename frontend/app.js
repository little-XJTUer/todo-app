const { createApp } = Vue;

// 组件定义
const Modal = {
    template: `
        <div class="modal-overlay" @click.self="$emit('close')">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">{{ title }}</h3>
                    <button class="modal-close" @click="$emit('close')">&times;</button>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
                <div class="modal-footer" v-if="$slots.footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    `,
    props: ['title'],
    emits: ['close']
};

const TodoItem = {
    template: `
        <div class="todo-item"
            :class="{
                completed: todo.completed,
                overdue: isOverdue(todo),
                today: isTodayDue(todo),
                'high-priority': todo.priority === 3,
                'medium-priority': todo.priority === 2,
                'low-priority': todo.priority === 1
            }"
        >
            <div 
                class="todo-checkbox" 
                :class="{ checked: todo.completed }"
                @click="$emit('toggle', todo)"
            >
                <i class="fas fa-check" v-if="todo.completed"></i>
            </div>
            <div class="todo-content">
                <div class="todo-title" :class="{ completed: todo.completed }">
                    {{ todo.task }}
                </div>
                <div class="todo-meta">
                    <span class="todo-tag category">
                        <i class="fas fa-folder"></i>{{ todo.category }}
                    </span>
                    <span class="todo-tag" :class="'priority-' + getPriorityText(todo.priority)">
                        <i class="fas fa-flag"></i>{{ getPriorityText(todo.priority) }}优先级
                    </span>
                    <span class="todo-tag" v-if="todo.dueDate">
                        <i class="fas fa-calendar"></i>{{ formatDueDate(todo.dueDate) }}
                    </span>
                    <span class="todo-tag">
                        <i class="fas fa-clock"></i>{{ formatDate(todo.createdAt) }}
                    </span>
                </div>
                <div class="todo-description" v-if="todo.description" style="margin-top: 8px; color: var(--gray-600); font-size: 0.9rem;">
                    {{ todo.description }}
                </div>
            </div>
            <div class="todo-actions">
                <button class="btn-icon edit" @click="$emit('edit', todo)" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" @click="$emit('delete', todo)" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `,
    props: ['todo'],
    emits: ['toggle', 'edit', 'delete'],
    methods: {
        formatDueDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            if (dueDate.getTime() === today.getTime()) {
                return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
            }

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (dueDate.getTime() === tomorrow.getTime()) {
                return '明天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
            }

            return date.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return '刚刚';
            if (diffMins < 60) return `${diffMins}分钟前`;
            if (diffHours < 24) return `${diffHours}小时前`;
            if (diffDays < 7) return `${diffDays}天前`;

            return date.toLocaleDateString('zh-CN');
        },
        isOverdue(todo) {
            if (!todo.dueDate || todo.completed) return false;
            const dueDate = new Date(todo.dueDate);
            const now = new Date();
            return dueDate < now;
        },
        isTodayDue(todo) {
            if (!todo.dueDate || todo.completed) return false;
            const dueDate = new Date(todo.dueDate);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            return dueDay.getTime() === today.getTime();
        },
        getPriorityText(priority) {
            switch (parseInt(priority)) {
                case 1: return '低';
                case 2: return '中';
                case 3: return '高';
                default: return '中';
            }
        }
    }
};

const TodoForm = {
    template: `
        <div class="add-todo-card">
            <div v-if="!expanded" class="collapsed-form">
                <button class="btn btn-outline" @click="expanded = true">
                    <i class="fas fa-plus"></i> 添加新任务
                </button>
            </div>
            
            <div v-else class="expanded-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="taskInput"><i class="fas fa-pencil-alt"></i> 任务内容</label>
                        <input 
                            type="text" 
                            id="taskInput"
                            class="form-control" 
                            :value="newTodo.task" 
                            @input="updateField('task', $event.target.value)"
                            @keyup.enter="addTodo"
                            placeholder="输入新的待办事项..."
                            maxlength="500"
                        >
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-tag"></i> 分类</label>
                        <select class="form-control" :value="newTodo.category" @change="updateField('category', $event.target.value)">
                            <option value="工作">工作</option>
                            <option value="学习">学习</option>
                            <option value="生活">生活</option>
                            <option value="购物">购物</option>
                            <option value="健康">健康</option>
                            <option value="其他">其他</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-flag"></i> 优先级</label>
                        <select class="form-control" :value="newTodo.priority" @change="updateField('priority', $event.target.value)">
                            <option value="1">低优先级</option>
                            <option value="2">中优先级</option>
                            <option value="3">高优先级</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" @click="addTodo" :disabled="!newTodo.task.trim()">
                        <i class="fas fa-plus"></i> 添加
                    </button>
                </div>
                <div class="form-group" style="margin-top: 15px;">
                    <label><i class="fas fa-align-left"></i> 任务描述（可选）</label>
                    <textarea 
                        class="form-control" 
                        :value="newTodo.description" 
                        @input="updateField('description', $event.target.value)"
                        placeholder="添加任务描述..."
                        rows="2"
                        maxlength="1000"
                    ></textarea>
                </div>
                <div class="form-group" style="margin-top: 15px;">
                    <label><i class="fas fa-calendar"></i> 截止时间（可选）</label>
                    <input 
                        type="datetime-local" 
                        class="form-control" 
                        :value="newTodo.dueDate"
                        @input="updateField('dueDate', $event.target.value)"
                    >
                </div>
                <div style="margin-top: 15px; text-align: right;">
                    <button class="btn btn-secondary" @click="expanded = false">
                        取消
                    </button>
                </div>
            </div>
        </div>
    `,
    props: ['newTodo'],
    emits: ['add-todo', 'update-todo'],
    data() {
        return {
            expanded: false
        };
    },
    methods: {
        addTodo() {
            this.$emit('add-todo');
            this.expanded = false;
        },
        updateField(field, value) {
            this.$emit('update-todo', field, value);
        }
    }
};

const Sidebar = {
    template: `
        <div class="sidebar">
            <div class="sidebar-section">
                <h3>任务视图</h3>
                <div class="sidebar-item" :class="{ active: currentView === 'all' }" @click="$emit('change-view', 'all')">
                    <i class="fas fa-inbox"></i>
                    <span>所有任务</span>
                    <span class="count">{{ stats.total || 0 }}</span>
                </div>
                <div class="sidebar-item" :class="{ active: currentView === 'today' }" @click="$emit('change-view', 'today')">
                    <i class="fas fa-calendar-day"></i>
                    <span>今天到期</span>
                    <span class="count">{{ stats.todayDue || 0 }}</span>
                </div>
                <div class="sidebar-item" :class="{ active: currentView === 'overdue' }" @click="$emit('change-view', 'overdue')">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>已过期</span>
                    <span class="count">{{ stats.overdue || 0 }}</span>
                </div>
                <div class="sidebar-item" :class="{ active: currentView === 'pending' }" @click="$emit('change-view', 'pending')">
                    <i class="fas fa-clock"></i>
                    <span>待完成</span>
                    <span class="count">{{ stats.pending || 0 }}</span>
                </div>
                <div class="sidebar-item" :class="{ active: currentView === 'completed' }" @click="$emit('change-view', 'completed')">
                    <i class="fas fa-check-circle"></i>
                    <span>已完成</span>
                    <span class="count">{{ stats.completed || 0 }}</span>
                </div>
            </div>

            <div class="sidebar-section">
                <h3>分类</h3>
                <div class="sidebar-item" :class="{ active: currentCategory === 'all' }" @click="$emit('change-category', 'all')">
                    <i class="fas fa-tags"></i>
                    <span>所有分类</span>
                </div>
                <div class="category-list">
                    <div class="sidebar-item" 
                         v-for="category in categories" 
                         :key="category"
                         :class="{ active: currentCategory === category }"
                         @click="$emit('change-category', category)">
                        <i class="fas fa-folder"></i>
                        <span>{{ category }}</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    props: ['currentView', 'currentCategory', 'stats', 'categories'],
    emits: ['change-view', 'change-category']
};

const Stats = {
    template: `
        <div class="stats-grid" v-if="shouldShowStats">
            <div class="stat-card" v-if="showTotal">
                <div class="stat-value">{{ getTotalCount }}</div>
                <div class="stat-label">{{ getTotalLabel }}</div>
            </div>
            <div class="stat-card completed" v-if="showCompleted">
                <div class="stat-value">{{ getCompletedCount }}</div>
                <div class="stat-label">{{ getCompletedLabel }}</div>
            </div>
            <div class="stat-card today" v-if="showTodayDue">
                <div class="stat-value">{{ getTodayDueCount }}</div>
                <div class="stat-label">{{ getTodayDueLabel }}</div>
            </div>
            <div class="stat-card overdue" v-if="showOverdue">
                <div class="stat-value">{{ getOverdueCount }}</div>
                <div class="stat-label">{{ getOverdueLabel }}</div>
            </div>
        </div>
    `,
    props: ['stats', 'currentView', 'filteredTodos', 'currentCategory'],
    computed: {
        shouldShowStats() {
            return true; // 在所有视图都显示统计信息
        },
        showTotal() {
            return this.currentView === 'all' || this.currentView === 'pending';
        },
        showCompleted() {
            return this.currentView === 'all' || this.currentView === 'completed';
        },
        showTodayDue() {
            return this.currentView === 'all' || this.currentView === 'today';
        },
        showOverdue() {
            return this.currentView === 'all' || this.currentView === 'overdue';
        },
        getTotalCount() {
            if (this.currentView === 'all') {
                return this.currentCategory === 'all' ? this.stats.total || 0 : this.filteredTodos.length;
            } else {
                return this.filteredTodos.length;
            }
        },
        getCompletedCount() {
            if (this.currentView === 'all') {
                return this.currentCategory === 'all' ? this.stats.completed || 0 : this.filteredTodos.filter(todo => todo.completed).length;
            } else if (this.currentView === 'completed') {
                return this.filteredTodos.length;
            }
            return 0;
        },
        getTodayDueCount() {
            if (this.currentView === 'all') {
                return this.currentCategory === 'all' ? this.stats.todayDue || 0 : this.filteredTodos.filter(todo => this.isTodayDue(todo)).length;
            } else if (this.currentView === 'today') {
                return this.filteredTodos.length;
            }
            return 0;
        },
        getOverdueCount() {
            if (this.currentView === 'all') {
                return this.currentCategory === 'all' ? this.stats.overdue || 0 : this.filteredTodos.filter(todo => this.isOverdue(todo)).length;
            } else if (this.currentView === 'overdue') {
                return this.filteredTodos.length;
            }
            return 0;
        },
        getTotalLabel() {
            if (this.currentCategory !== 'all') {
                return `${this.currentCategory}任务`;
            }
            return this.currentView === 'pending' ? '待完成任务' : '总任务数';
        },
        getCompletedLabel() {
            if (this.currentCategory !== 'all') {
                return `${this.currentCategory}已完成`;
            }
            return '已完成';
        },
        getTodayDueLabel() {
            if (this.currentCategory !== 'all') {
                return `${this.currentCategory}今日到期`;
            }
            return '今天到期';
        },
        getOverdueLabel() {
            if (this.currentCategory !== 'all') {
                return `${this.currentCategory}已过期`;
            }
            return '已过期';
        }
    },
    methods: {
        isOverdue(todo) {
            if (!todo.dueDate || todo.completed) return false;
            const dueDate = new Date(todo.dueDate);
            const now = new Date();
            return dueDate < now;
        },
        isTodayDue(todo) {
            if (!todo.dueDate || todo.completed) return false;
            const dueDate = new Date(todo.dueDate);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            return dueDay.getTime() === today.getTime();
        }
    }
};

const TodoList = {
    template: `
        <div class="todo-list">
            <todo-item 
                v-for="todo in todos" 
                :key="todo.id"
                :todo="todo"
                @toggle="$emit('toggle-todo', $event)"
                @edit="$emit('edit-todo', $event)"
                @delete="$emit('delete-todo', $event)"
            ></todo-item>

            <!-- 空状态 -->
            <div v-if="todos.length === 0" class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>暂无待办事项</h3>
                <p>添加一个任务开始管理您的时间吧！</p>
            </div>
        </div>
    `,
    components: {
        'todo-item': TodoItem
    },
    props: ['todos'],
    emits: ['toggle-todo', 'edit-todo', 'delete-todo']
};

// 主应用组件
const App = {
    template: `
        <div class="app-container">
            <!-- 头部 -->
            <div class="app-header">
                <h1><i class="fas fa-tasks"></i> 智能待办清单</h1>
                <p class="subtitle">高效管理您的任务，提升生产力</p>
            </div>

            <div class="app-content">
                <!-- 侧边栏 -->
                <sidebar 
                    :current-view="currentView"
                    :current-category="currentCategory"
                    :stats="stats"
                    :categories="categories"
                    @change-view="changeView"
                    @change-category="changeCategory"
                ></sidebar>

                <!-- 主内容区 -->
                <div class="main-content">
                    <!-- 统计信息 -->
                    <stats 
                        :stats="stats"
                        :current-view="currentView"
                        :filtered-todos="filteredTodos"
                        :current-category="currentCategory"
                    ></stats>

                    <!-- 添加待办事项 -->
                    <todo-form
                        :new-todo="newTodo"
                        @add-todo="addTodo"
                        @update-todo="updateNewTodo"
                    ></todo-form>

                    <!-- 加载状态 -->
                    <div v-if="loading" class="loading">
                        <i class="fas fa-spinner"></i>
                        <p>加载中...</p>
                    </div>

                    <!-- 待办事项列表 -->
                    <todo-list
                        v-else
                        :todos="filteredTodos"
                        @toggle-todo="toggleTodo"
                        @edit-todo="editTodo"
                        @delete-todo="showDeleteModal"
                    ></todo-list>
                </div>
            </div>
        </div>

        <!-- 删除确认模态框 -->
        <modal 
            v-if="showDeleteConfirm"
            title="确认删除"
            @close="showDeleteConfirm = false"
        >
            <p>确定要删除任务 "<strong>{{ todoToDelete?.task }}</strong>" 吗？此操作无法撤销。</p>
            <template #footer>
                <button class="btn btn-secondary" @click="showDeleteConfirm = false">取消</button>
                <button class="btn btn-danger" @click="confirmDelete">确认删除</button>
            </template>
        </modal>

        <!-- 编辑任务模态框 -->
        <modal 
            v-if="showEditModal"
            title="编辑任务"
            @close="showEditModal = false"
        >
            <div class="form-group">
                <label>任务内容</label>
                <input type="text" class="form-control" v-model="editingTodo.task" maxlength="500">
            </div>
            <div class="form-group">
                <label>分类</label>
                <select class="form-control" v-model="editingTodo.category">
                    <option value="工作">工作</option>
                    <option value="学习">学习</option>
                    <option value="生活">生活</option>
                    <option value="购物">购物</option>
                    <option value="健康">健康</option>
                    <option value="其他">其他</option>
                </select>
            </div>
            <div class="form-group">
                <label>优先级</label>
                <select class="form-control" v-model="editingTodo.priority">
                    <option value="1">低优先级</option>
                    <option value="2">中优先级</option>
                    <option value="3">高优先级</option>
                </select>
            </div>
            <div class="form-group">
                <label>任务描述</label>
                <textarea class="form-control" v-model="editingTodo.description" rows="3" maxlength="1000"></textarea>
            </div>
            <div class="form-group">
                <label>截止时间</label>
                <input type="datetime-local" class="form-control" v-model="editingTodo.dueDate">
            </div>
            <template #footer>
                <button class="btn btn-secondary" @click="showEditModal = false">取消</button>
                <button class="btn btn-primary" @click="saveEdit">保存更改</button>
            </template>
        </modal>
    `,

    components: {
        'sidebar': Sidebar,
        'stats': Stats,
        'todo-form': TodoForm,
        'todo-list': TodoList,
        'modal': Modal
    },

    data() {
        return {
            todos: [],
            categories: ['工作', '学习', '生活', '购物', '健康', '其他'],
            currentView: 'all',
            currentCategory: 'all',
            stats: {},
            loading: false,

            newTodo: {
                task: '',
                category: '工作',
                priority: 2,
                description: '',
                dueDate: ''
            },

            showDeleteConfirm: false,
            todoToDelete: null,

            showEditModal: false,
            editingTodo: null,

            apiBaseUrl: '/api/todos'
        };
    },

    computed: {
        filteredTodos() {
            let filtered = [...this.todos];

            // 根据视图筛选
            switch (this.currentView) {
                case 'today':
                    filtered = this.todos.filter(todo => this.isTodayDue(todo) && !todo.completed);
                    break;
                case 'overdue':
                    filtered = this.todos.filter(todo => this.isOverdue(todo) && !todo.completed);
                    break;
                case 'pending':
                    filtered = this.todos.filter(todo => !todo.completed);
                    break;
                case 'completed':
                    filtered = this.todos.filter(todo => todo.completed);
                    break;
                default:
                    filtered = this.todos; // 'all' 视图显示所有任务
            }

            // 在所有视图下都应用分类筛选
            if (this.currentCategory !== 'all') {
                filtered = filtered.filter(todo => todo.category === this.currentCategory);
            }

            return filtered;
        }
    },

    mounted() {
        this.loadTodos();
        this.loadStats();
        this.loadCategories();
    },

    methods: {
        // 加载所有待办事项
        async loadTodos() {
            this.loading = true;
            try {
                const response = await axios.get(this.apiBaseUrl);
                this.todos = response.data;
            } catch (error) {
                this.showError('加载待办事项失败');
                console.error('加载失败:', error);
            } finally {
                this.loading = false;
            }
        },

        // 加载统计信息
        async loadStats() {
            try {
                const response = await axios.get(`${this.apiBaseUrl}/stats`);
                this.stats = response.data;
            } catch (error) {
                console.error('加载统计信息失败:', error);
            }
        },

        // 加载分类
        async loadCategories() {
            try {
                const response = await axios.get(`${this.apiBaseUrl}/categories`);
                this.categories = [...new Set([...this.categories, ...response.data])];
            } catch (error) {
                console.error('加载分类失败:', error);
            }
        },

        // 添加新的待办事项
        async addTodo() {
            if (!this.newTodo.task.trim()) {
                this.showError('请输入待办事项内容！');
                return;
            }

            try {
                const todoData = {
                    task: this.newTodo.task.trim(),
                    category: this.newTodo.category,
                    priority: parseInt(this.newTodo.priority),
                    description: this.newTodo.description.trim()
                };

                // 如果有截止时间，添加到请求数据中
                if (this.newTodo.dueDate) {
                    todoData.dueDate = this.newTodo.dueDate + ':00';
                }

                const response = await axios.post(this.apiBaseUrl, todoData);
                this.todos.push(response.data);

                // 重置表单
                this.newTodo = {
                    task: '',
                    category: '工作',
                    priority: 2,
                    description: '',
                    dueDate: ''
                };

                this.loadStats();
                this.loadCategories();

            } catch (error) {
                this.showError('添加待办事项失败！');
                console.error('添加失败:', error);
            }
        },

        // 更新新待办事项数据
        updateNewTodo(field, value) {
            this.newTodo[field] = value;
        },

        // 切换任务完成状态
        async toggleTodo(todo) {
            try {
                todo.completed = !todo.completed;
                await axios.put(`${this.apiBaseUrl}/${todo.id}`, {
                    completed: todo.completed
                });
                this.loadStats();
            } catch (error) {
                this.showError('更新任务状态失败！');
                console.error('更新失败:', error);
                // 回滚状态
                todo.completed = !todo.completed;
            }
        },

        // 显示删除确认模态框
        showDeleteModal(todo) {
            this.todoToDelete = todo;
            this.showDeleteConfirm = true;
        },

        // 确认删除
        async confirmDelete() {
            if (!this.todoToDelete) return;

            try {
                await axios.delete(`${this.apiBaseUrl}/${this.todoToDelete.id}`);
                this.todos = this.todos.filter(todo => todo.id !== this.todoToDelete.id);
                this.showDeleteConfirm = false;
                this.todoToDelete = null;
                this.loadStats();
            } catch (error) {
                this.showError('删除待办事项失败！');
                console.error('删除失败:', error);
            }
        },

        // 编辑待办事项
        editTodo(todo) {
            this.editingTodo = { ...todo };
            // 转换日期格式用于datetime-local输入
            if (this.editingTodo.dueDate) {
                const date = new Date(this.editingTodo.dueDate);
                this.editingTodo.dueDate = date.toISOString().slice(0, 16);
            }
            this.showEditModal = true;
        },

        // 保存编辑
        async saveEdit() {
            if (!this.editingTodo.task.trim()) {
                this.showError('任务内容不能为空！');
                return;
            }

            try {
                const updateData = {
                    task: this.editingTodo.task.trim(),
                    category: this.editingTodo.category,
                    priority: parseInt(this.editingTodo.priority),
                    description: this.editingTodo.description.trim()
                };

                if (this.editingTodo.dueDate) {
                    updateData.dueDate = this.editingTodo.dueDate + ':00';
                } else {
                    updateData.dueDate = null;
                }

                const response = await axios.put(`${this.apiBaseUrl}/${this.editingTodo.id}`, updateData);

                // 更新本地数据
                const index = this.todos.findIndex(todo => todo.id === this.editingTodo.id);
                if (index !== -1) {
                    this.todos[index] = response.data;
                }

                this.showEditModal = false;
                this.editingTodo = null;
                this.loadStats();

            } catch (error) {
                this.showError('更新待办事项失败！');
                console.error('更新失败:', error);
            }
        },

        // 更改视图
        changeView(view) {
            this.currentView = view;
        },

        // 更改分类
        changeCategory(category) {
            this.currentCategory = category;
        },

        // 检查是否过期
        isOverdue(todo) {
            if (!todo.dueDate || todo.completed) return false;
            const dueDate = new Date(todo.dueDate);
            const now = new Date();
            return dueDate < now;
        },

        // 检查是否今天到期
        isTodayDue(todo) {
            if (!todo.dueDate || todo.completed) return false;
            const dueDate = new Date(todo.dueDate);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            return dueDay.getTime() === today.getTime();
        },

        // 显示错误消息
        showError(message) {
            alert(message);
        }
    }
};

// 创建并挂载应用
createApp(App).mount('#app');