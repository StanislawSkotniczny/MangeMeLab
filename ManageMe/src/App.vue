<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Project } from './models/Project';
import { ProjectService } from './services/ProjectService';
import { AuthService } from './services/AuthService';
import { ActiveProjectService } from './services/ActiveProjectService';
import type { Story, StoryPriority, StoryState } from './models/Story';
import { StoryService } from './services/StoryService';
import type { User, UserRole } from './models/User';
import type { Task, TaskPriority, TaskState } from './models/Task';
import { TaskService } from './services/TaskService';
import DarkModeToggle from './components/DarkModeToggle.vue';

// Użytkownicy
const user: User = AuthService.getCurrentUser();
const users: User[] = AuthService.getAllUsers();
const devUsers = computed(() => users.filter(u => u.role === 'developer' || u.role === 'devops'));

// Projekty
const projects = ref<Project[]>([]);
const form = ref<{ id: number | null; name: string; description: string }>({
  id: null,
  name: '',
  description: ''
});

// Aktywny projekt
const activeProjectId = ref<number | null>(ActiveProjectService.getActiveProject());
const activeProject = computed(() => projects.value.find(p => p.id === activeProjectId.value) ?? null);

function setActiveProject(id: number) {
  activeProjectId.value = id;
  ActiveProjectService.setActiveProject(id);
  loadStories();
  resetTaskView();
  activeStoryId.value = null;
}

// CRUD projektów
function loadProjects() {
  projects.value = ProjectService.getAll();
}

function resetForm() {
  form.value = { id: null, name: '', description: '' };
}

function onSubmit() {
  if (form.value.id === null) {
    const newProject: Project = {
      id: Date.now(),
      name: form.value.name,
      description: form.value.description
    };
    ProjectService.add(newProject);
  } else {
    ProjectService.update({
      id: form.value.id,
      name: form.value.name,
      description: form.value.description
    });
  }
  loadProjects();
  resetForm();
}

function editProject(project: Project) {
  form.value = { ...project };
}

function deleteProject(id: number) {
  ProjectService.delete(id);
  loadProjects();
  resetForm();
  if (activeProjectId.value === id) {
    activeProjectId.value = null;
    ActiveProjectService.setActiveProject(-1);
  }
}

// --- STORY CRUD ---
const stories = ref<Story[]>([]);
const storyForm = ref<{
  id: number | null;
  name: string;
  description: string;
  priority: StoryPriority;
}>({
  id: null,
  name: '',
  description: '',
  priority: 'średni',
});
const activeStoryId = ref<number | null>(null);
const activeStory = computed(() => stories.value.find(s => s.id === activeStoryId.value) ?? null);

function loadStories() {
  if (activeProjectId.value != null) {
    stories.value = StoryService.getByProject(activeProjectId.value);
  } else {
    stories.value = [];
  }
}

function resetStoryForm() {
  storyForm.value = { id: null, name: '', description: '', priority: 'średni' };
}

function onStorySubmit() {
  if (!activeProjectId.value) return;
  if (storyForm.value.id === null) {
    const newStory: Story = {
      id: Date.now(),
      name: storyForm.value.name,
      description: storyForm.value.description,
      priority: storyForm.value.priority,
      projectId: activeProjectId.value,
      createdAt: new Date().toISOString(),
      state: 'todo',
      ownerId: user.id
    };
    StoryService.add(newStory);
  } else {

    StoryService.update({
      id: storyForm.value.id,
      name: storyForm.value.name,
      description: storyForm.value.description,
      priority: storyForm.value.priority,
      projectId: activeProjectId.value,
      createdAt: stories.value.find(s => s.id === storyForm.value.id)?.createdAt || new Date().toISOString(),
      state: stories.value.find(s => s.id === storyForm.value.id)?.state || 'todo',
      ownerId: user.id
    });
  }
  loadStories();
  resetStoryForm();
}

function editStory(story: Story) {
  storyForm.value = {
    id: story.id,
    name: story.name,
    description: story.description,
    priority: story.priority
  };
}

function deleteStory(id: number) {
  StoryService.delete(id);
  loadStories();
  resetStoryForm();
  if (activeStoryId.value === id) {
    activeStoryId.value = null;
    resetTaskView();
  }
}

const storiesTodo = computed(() => stories.value.filter(s => s.state === 'todo'));
const storiesDoing = computed(() => stories.value.filter(s => s.state === 'doing'));
const storiesDone = computed(() => stories.value.filter(s => s.state === 'done'));

function changeStoryState(story: Story, newState: StoryState) {
  StoryService.update({ ...story, state: newState });
  loadStories();
  if (activeStoryId.value === story.id) {
    activeStoryId.value = null;
    resetTaskView();
  }
}

// --- TASKS ---
const tasks = ref<Task[]>([]);
const taskForm = ref<{
  id: number | null;
  name: string;
  description: string;
  priority: TaskPriority;
  estimatedTime: number;
  assigneeId: number | null;
}>({
  id: null,
  name: '',
  description: '',
  priority: 'średni',
  estimatedTime: 1,
  assigneeId: null
});

function loadTasks() {
  if (activeStoryId.value != null) {
    tasks.value = TaskService.getByStory(activeStoryId.value);
  } else {
    tasks.value = [];
  }
}

function resetTaskForm() {
  taskForm.value = { id: null, name: '', description: '', priority: 'średni', estimatedTime: 1, assigneeId: null };
}

function resetTaskView() {
  loadTasks();
  resetTaskForm();
}

function onTaskSubmit() {
  if (!activeStoryId.value) return;
  if (taskForm.value.id === null) {
    const newTask: Task = {
      id: Date.now(),
      name: taskForm.value.name,
      description: taskForm.value.description,
      priority: taskForm.value.priority,
      storyId: activeStoryId.value,
      estimatedTime: taskForm.value.estimatedTime,
      state: taskForm.value.assigneeId ? 'doing' : 'todo',
      createdAt: new Date().toISOString(),
      startDate: taskForm.value.assigneeId ? new Date().toISOString() : undefined,
      endDate: undefined,
      assigneeId: taskForm.value.assigneeId || undefined
    };
    TaskService.add(newTask);
  } else {
    const prev = tasks.value.find(t => t.id === taskForm.value.id);
    TaskService.update({
      id: taskForm.value.id,
      name: taskForm.value.name,
      description: taskForm.value.description,
      priority: taskForm.value.priority,
      storyId: activeStoryId.value,
      estimatedTime: taskForm.value.estimatedTime,
      state: prev?.state || 'todo',
      createdAt: prev?.createdAt || new Date().toISOString(),
      startDate: prev?.startDate,
      endDate: prev?.endDate,
      assigneeId: taskForm.value.assigneeId || undefined
    });
  }
  loadTasks();
  resetTaskForm();
}

function editTask(task: Task) {
  taskForm.value = {
    id: task.id,
    name: task.name,
    description: task.description,
    priority: task.priority,
    estimatedTime: task.estimatedTime,
    assigneeId: task.assigneeId || null
  };
}

function deleteTask(id: number) {
  TaskService.delete(id);
  loadTasks();
  resetTaskForm();
}

function assignUserToTask(task: Task, userId: number) {
  // Przypisanie osoby automatycznie zmienia stan na doing i ustawia datę startu
  TaskService.update({
    ...task,
    assigneeId: userId,
    state: 'doing',
    startDate: task.startDate || new Date().toISOString()
  });
  loadTasks();
}

function markTaskDone(task: Task) {
  TaskService.update({
    ...task,
    state: 'done',
    endDate: new Date().toISOString()
  });
  loadTasks();
}

function changeTaskState(task: Task, newState: TaskState) {
  TaskService.update({ ...task, state: newState });
  loadTasks();
}

const tasksTodo = computed(() => tasks.value.filter(t => t.state === 'todo'));
const tasksDoing = computed(() => tasks.value.filter(t => t.state === 'doing'));
const tasksDone = computed(() => tasks.value.filter(t => t.state === 'done'));

onMounted(() => {
  loadProjects();
  loadStories();
  loadTasks();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">ManageMe</h1>
        <div class="flex items-center space-x-4">
          <span class="text-gray-700 dark:text-gray-300">{{ user.firstName }} {{ user.lastName }}</span>
          <DarkModeToggle />
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Projects Section -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Projekty</h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form @submit.prevent="onSubmit" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa</label>
              <input
                type="text"
                id="name"
                v-model="form.name"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis</label>
              <textarea
                id="description"
                v-model="form.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="resetForm"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Reset
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {{ form.id === null ? 'Dodaj' : 'Zapisz' }}
              </button>
            </div>
          </form>

          <div class="mt-6">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="project in projects"
                :key="project.id"
                :class="[
                  'rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer',
                  project.id === activeProjectId ? 'ring-4 ring-blue-500 bg-blue-100 dark:bg-blue-900' : 'bg-white dark:bg-gray-700'
                ]"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ project.name }}</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ project.description }}</p>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      @click="editProject(project)"
                      class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edytuj
                    </button>
                    <button
                      @click="deleteProject(project.id)"
                      class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
                <button
                  @click="setActiveProject(project.id)"
                  class="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Wybierz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stories Section -->
      <div v-if="activeProject" class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Historie użytkownika</h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form @submit.prevent="onStorySubmit" class="space-y-4">
            <div>
              <label for="storyName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa</label>
              <input
                type="text"
                id="storyName"
                v-model="storyForm.name"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label for="storyDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis</label>
              <textarea
                id="storyDescription"
                v-model="storyForm.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
            <div>
              <label for="storyPriority" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Priorytet</label>
              <select
                id="storyPriority"
                v-model="storyForm.priority"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="niski">Niski</option>
                <option value="średni">Średni</option>
                <option value="wysoki">Wysoki</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="resetStoryForm"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Reset
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {{ storyForm.id === null ? 'Dodaj' : 'Zapisz' }}
              </button>
            </div>
          </form>

          <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <!-- Todo Column -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Do zrobienia</h3>
              <div class="space-y-4">
                <div
                  v-for="story in storiesTodo"
                  :key="story.id"
                  :class="[
                    'bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer',
                    story.id === activeStoryId ? 'ring-4 ring-blue-500 bg-blue-100 dark:bg-blue-900' : ''
                  ]"
                  @click="activeStoryId = story.id"
                >
                  <h4 class="text-md font-medium text-gray-900 dark:text-white">{{ story.name }}</h4>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ story.description }}</p>
                  <div class="mt-4 flex justify-between items-center">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Priorytet: {{ story.priority }}</span>
                    <div class="flex space-x-2">
                      <button
                        @click.stop="editStory(story)"
                        class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edytuj
                      </button>
                      <button
                        @click.stop="deleteStory(story.id)"
                        class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                  <button
                    @click.stop="changeStoryState(story, 'doing')"
                    class="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Rozpocznij
                  </button>
                </div>
              </div>
            </div>

            <!-- Doing Column -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">W trakcie</h3>
              <div class="space-y-4">
                <div
                  v-for="story in storiesDoing"
                  :key="story.id"
                  :class="[
                    'bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer',
                    story.id === activeStoryId ? 'ring-4 ring-blue-500 bg-blue-100 dark:bg-blue-900' : ''
                  ]"
                  @click="activeStoryId = story.id"
                >
                  <h4 class="text-md font-medium text-gray-900 dark:text-white">{{ story.name }}</h4>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ story.description }}</p>
                  <div class="mt-4 flex justify-between items-center">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Priorytet: {{ story.priority }}</span>
                    <div class="flex space-x-2">
                      <button
                        @click.stop="editStory(story)"
                        class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edytuj
                      </button>
                      <button
                        @click.stop="deleteStory(story.id)"
                        class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                  <div class="mt-4 flex space-x-2">
                    <button
                      @click.stop="changeStoryState(story, 'todo')"
                      class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Wróć
                    </button>
                    <button
                      @click.stop="changeStoryState(story, 'done')"
                      class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Zakończ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Done Column -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Zakończone</h3>
              <div class="space-y-4">
                <div
                  v-for="story in storiesDone"
                  :key="story.id"
                  :class="[
                    'bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer',
                    story.id === activeStoryId ? 'ring-4 ring-blue-500 bg-blue-100 dark:bg-blue-900' : ''
                  ]"
                  @click="activeStoryId = story.id"
                >
                  <h4 class="text-md font-medium text-gray-900 dark:text-white">{{ story.name }}</h4>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ story.description }}</p>
                  <div class="mt-4 flex justify-between items-center">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Priorytet: {{ story.priority }}</span>
                    <div class="flex space-x-2">
                      <button
                        @click.stop="editStory(story)"
                        class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edytuj
                      </button>
                      <button
                        @click.stop="deleteStory(story.id)"
                        class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                  <button
                    @click.stop="changeStoryState(story, 'doing')"
                    class="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Wznów
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tasks Section -->
      <div v-if="activeStory" class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Zadania</h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form @submit.prevent="onTaskSubmit" class="space-y-4">
            <div>
              <label for="taskName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa</label>
              <input
                type="text"
                id="taskName"
                v-model="taskForm.name"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label for="taskDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis</label>
              <textarea
                id="taskDescription"
                v-model="taskForm.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label for="taskPriority" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Priorytet</label>
                <select
                  id="taskPriority"
                  v-model="taskForm.priority"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="niski">Niski</option>
                  <option value="średni">Średni</option>
                  <option value="wysoki">Wysoki</option>
                </select>
              </div>
              <div>
                <label for="estimatedTime" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Szacowany czas (h)</label>
                <input
                  type="number"
                  id="estimatedTime"
                  v-model="taskForm.estimatedTime"
                  min="1"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label for="assignee" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Przypisany do</label>
                <select
                  id="assignee"
                  v-model="taskForm.assigneeId"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option :value="null">Nie przypisano</option>
                  <option v-for="dev in devUsers" :key="dev.id" :value="dev.id">
                    {{ dev.firstName }} {{ dev.lastName }}
                  </option>
                </select>
              </div>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="resetTaskForm"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Reset
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {{ taskForm.id === null ? 'Dodaj' : 'Zapisz' }}
              </button>
            </div>
          </form>

          <div class="mt-6">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="task in tasks"
                :key="task.id"
                class="bg-white dark:bg-gray-700 rounded-lg shadow p-4"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ task.name }}</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ task.description }}</p>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      @click="editTask(task)"
                      class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edytuj
                    </button>
                    <button
                      @click="deleteTask(task.id)"
                      class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
                <div class="mt-4 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500 dark:text-gray-400">Priorytet:</span>
                    <span class="text-gray-900 dark:text-white">{{ task.priority }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500 dark:text-gray-400">Szacowany czas:</span>
                    <span class="text-gray-900 dark:text-white">{{ task.estimatedTime }}h</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500 dark:text-gray-400">Przypisany do:</span>
                    <span class="text-gray-900 dark:text-white">
                      {{ task.assigneeId ? (users.find(u => u.id === task.assigneeId)?.firstName + ' ' + users.find(u => u.id === task.assigneeId)?.lastName) : 'Nie przypisano' }}
                    </span>
                  </div>
                </div>
                <div class="mt-4 flex space-x-2">
                  <button
                    @click="changeTaskState(task, 'todo')"
                    :class="[
                      'flex-1 px-4 py-2 text-sm font-medium rounded-md border',
                      task.state === 'todo'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                    ]"
                  >
                    Do zrobienia
                  </button>
                  <button
                    @click="changeTaskState(task, 'doing')"
                    :class="[
                      'flex-1 px-4 py-2 text-sm font-medium rounded-md border',
                      task.state === 'doing'
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                    ]"
                  >
                    W trakcie
                  </button>
                  <button
                    @click="changeTaskState(task, 'done')"
                    :class="[
                      'flex-1 px-4 py-2 text-sm font-medium rounded-md border',
                      task.state === 'done'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                    ]"
                  >
                    Zakończone
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@import './assets/main.css';
</style>
