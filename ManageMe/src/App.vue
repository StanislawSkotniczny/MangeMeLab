<template>
  <!-- logowanie -->
  <LoginForm v-if="!loggedIn" @login-success="onLoginSuccess" />

  <!-- głowna apka -->
  <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">ManageMe</h1>
        <div class="flex items-center space-x-4">
          <span class="text-gray-700 dark:text-gray-300">
            {{ currentUser?.firstName }} {{ currentUser?.lastName }}
          </span>
          <button @click="logout"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors duration-200">
            Wyloguj
          </button>
          <DarkModeToggle />
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Section: Projects -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Projekty</h2>

        <!-- Project Form -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <form @submit.prevent="onSubmit" class="space-y-4">
            <div>
              <label for="projectName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa
                projektu</label>
              <input id="projectName" v-model="form.name" type="text" required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Wprowadź nazwę projektu" />
            </div>
            <div>
              <label for="projectDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis
                projektu</label>
              <textarea id="projectDescription" v-model="form.description" rows="3"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Wprowadź opis projektu"></textarea>
            </div>
            <div class="flex space-x-2">
              <button type="submit"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200">
                {{ form.id ? 'Aktualizuj projekt' : 'Dodaj projekt' }}
              </button>
              <button v-if="form.id" type="button" @click="resetForm"
                class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">
                Anuluj
              </button>
            </div>
          </form>
        </div>

        <!-- Projects List -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="project in projects" :key="project.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200"
            :class="{ 'ring-2 ring-blue-500': activeProjectId === project.id }">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ project.name }}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">{{ project.description }}</p>
            <div class="flex space-x-2">
              <button @click="selectProject(project)"
                class="flex-1 bg-green-600 text-white px-3 py-2 text-sm rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-200">
                Wybierz
              </button>
              <button @click="editProject(project)"
                class="px-3 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 transition-colors duration-200">
                Edytuj
              </button>
              <button @click="deleteProject(project.id)"
                class="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors duration-200">
                Usuń
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Stories -->
      <section v-if="activeProjectId" class="mb-12">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Historyjki użytkownika</h2>

        <!-- Story Form -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <form @submit.prevent="onStorySubmit" class="space-y-4">
            <div>
              <label for="storyName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa
                historyjki</label>
              <input id="storyName" v-model="storyForm.name" type="text" required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Wprowadź nazwę historyjki" />
            </div>
            <div>
              <label for="storyDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis
                historyjki</label>
              <textarea id="storyDescription" v-model="storyForm.description" rows="3"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Wprowadź opis historyjki"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="storyPriority"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300">Priorytet</label>
                <select id="storyPriority" v-model="storyForm.priority"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="niski">Niski</option>
                  <option value="średni">Średni</option>
                  <option value="wysoki">Wysoki</option>
                </select>
              </div>
              <div>
                <label for="storyStatus"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select id="storyStatus" v-model="storyForm.status"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="todo">Do zrobienia</option>
                  <option value="doing">W trakcie</option>
                  <option value="done">Zakończone</option>
                </select>
              </div>
              <div>
                <label for="storyOwner"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300">Właściciel</label>
                <select id="storyOwner" v-model="storyForm.ownerId"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option :value="null">Nie przypisano</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.firstName }} {{ user.lastName }}
                  </option>
                </select>
              </div>
            </div>
            <div class="flex space-x-2">
              <button type="submit"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200">
                {{ storyForm.id ? 'Aktualizuj historyjkę' : 'Dodaj historyjkę' }}
              </button>
              <button v-if="storyForm.id" type="button" @click="resetStoryForm"
                class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">
                Anuluj
              </button>
            </div>
          </form>
        </div>

        <!-- Stories List -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="story in stories" :key="story.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200"
            :class="{ 'ring-2 ring-blue-500': activeStoryId === story.id }">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ story.name }}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-2">{{ story.description }}</p>
            <div class="space-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p><strong>Priorytet:</strong> {{ story.priority }}</p>
              <p><strong>Status:</strong> {{ story.status }}</p>
              <p>
                <strong>Właściciel:</strong>
                {{story.ownerId ?
                  (users.find(u => u.id === story.ownerId)?.firstName + ' ' +
                    users.find(u => u.id === story.ownerId)?.lastName) :
                  'Nie przypisano'
                }}
              </p>
            </div>
            <div class="flex space-x-2">
              <button @click="selectStory(story)"
                class="flex-1 bg-green-600 text-white px-3 py-2 text-sm rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-200">
                Wybierz
              </button>
              <button @click="editStory(story)"
                class="px-3 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 transition-colors duration-200">
                Edytuj
              </button>
              <button @click="deleteStory(story.id)"
                class="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors duration-200">
                Usuń
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Tasks -->
      <section v-if="activeStoryId" class="mb-12">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Zadania</h2>

        <!-- Task Form -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <form @submit.prevent="onTaskSubmit" class="space-y-4">
            <div>
              <label for="taskName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa
                zadania</label>
              <input id="taskName" v-model="taskForm.name" type="text" required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Wprowadź nazwę zadania" />
            </div>
            <div>
              <label for="taskDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis
                zadania</label>
              <textarea id="taskDescription" v-model="taskForm.description" rows="3"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Wprowadź opis zadania"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label for="taskPriority"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300">Priorytet</label>
                <select id="taskPriority" v-model="taskForm.priority"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="niski">Niski</option>
                  <option value="średni">Średni</option>
                  <option value="wysoki">Wysoki</option>
                </select>
              </div>
              <div>
                <label for="taskState" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Stan</label>
                <select id="taskState" v-model="taskForm.state"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="todo">Do zrobienia</option>
                  <option value="doing">W trakcie</option>
                  <option value="done">Zakończone</option>
                </select>
              </div>
              <div>
                <label for="taskEstimatedTime"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300">Szacowany czas (h)</label>
                <input id="taskEstimatedTime" v-model.number="taskForm.estimatedTime" type="number" min="0" step="0.5"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="8" />
              </div>
              <div>
                <label for="taskAssignee" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Przypisana
                  osoba</label>
                <select id="taskAssignee" v-model="taskForm.assigneeId"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option :value="null">Nie przypisano</option>
                  <option v-for="dev in devUsers" :key="dev.id" :value="dev.id">
                    {{ dev.firstName }} {{ dev.lastName }}
                  </option>
                </select>
              </div>
            </div>
            <div class="flex space-x-2">
              <button type="submit"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200">
                {{ taskForm.id ? 'Aktualizuj zadanie' : 'Dodaj zadanie' }}
              </button>
              <button v-if="taskForm.id" type="button" @click="resetTaskForm"
                class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">
                Anuluj
              </button>
            </div>
          </form>
        </div>

        <!-- Tasks List -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="task in tasks" :key="task.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ task.name }}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-2">{{ task.description }}</p>
            <div class="space-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p><strong>Priorytet:</strong> {{ task.priority }}</p>
              <p><strong>Stan:</strong> {{ task.state }}</p>
              <p><strong>Szacowany czas:</strong> {{ task.estimatedTime }}h</p>
              <p>
                <strong>Przypisana osoba:</strong>
                {{task.assigneeId ?
                  (users.find(u => u.id === task.assigneeId)?.firstName + ' ' +
                    users.find(u => u.id === task.assigneeId)?.lastName) :
                  'Nie przypisano'
                }}
              </p>
            </div>
            <div class="flex space-x-2">
              <button @click="editTask(task)"
                class="flex-1 bg-yellow-600 text-white px-3 py-2 text-sm rounded-md hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 transition-colors duration-200">
                Edytuj
              </button>
              <button @click="deleteTask(task.id)"
                class="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors duration-200">
                Usuń
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Project } from './models/Project';
import { ProjectService } from './services/ProjectService';
import { ActiveProjectService } from './services/ActiveProjectService';
import type { Story, StoryPriority, StoryState } from './models/Story';
import { StoryService } from './services/StoryService';
import type { User, UserRole } from './models/User';
import type { Task, TaskPriority, TaskState } from './models/Task';
import { TaskService } from './services/TaskService';
import DarkModeToggle from './components/DarkModeToggle.vue';
import LoginForm from './components/LoginForm.vue';

const loggedIn = ref(false);
const currentUser = ref<User | null>(null);
const authToken = ref<string | null>(localStorage.getItem('token'));

const users: User[] = [
  { id: '1', firstName: 'Jan', lastName: 'Kowalski', role: 'admin' },
  { id: '2', firstName: 'Anna', lastName: 'Nowak', role: 'developer' },
  { id: '3', firstName: 'Piotr', lastName: 'Zieliński', role: 'devops' }
];

const devUsers = computed(() => users.filter(u => u.role === 'developer' || u.role === 'devops'));

// Projekty
const projects = ref<Project[]>([]);
const activeProjectId = ref<string | null>(null);
const form = ref<{ id: string | null; name: string; description: string }>({
  id: null,
  name: '',
  description: ''
});

const activeProject = computed(() =>
  projects.value.find(p => p.id === activeProjectId.value) ?? null
);

// Stories
const stories = ref<Story[]>([]);
const activeStoryId = ref<string | null>(null);
const storyForm = ref<{
  id: string | null;
  name: string;
  description: string;
  priority: StoryPriority;
  status: StoryState;
  ownerId: string | null
}>({
  id: null,
  name: '',
  description: '',
  priority: 'średni',
  status: 'todo',
  ownerId: null
});

const activeStory = computed(() =>
  stories.value.find(s => s.id === activeStoryId.value) ?? null
);

// Tasks
const tasks = ref<Task[]>([]);
const taskForm = ref<{
  id: string | null;
  name: string;
  description: string;
  priority: TaskPriority;
  state: TaskState;
  estimatedTime: number;
  assigneeId: string | null
}>({
  id: null,
  name: '',
  description: '',
  priority: 'średni',
  state: 'todo',
  estimatedTime: 1,
  assigneeId: null
});

onMounted(async () => {
  if (authToken.value) {
    try {
      const response = await fetch('http://localhost:3000/api/me', {
        headers: { Authorization: 'Bearer ' + authToken.value }
      });

      if (response.ok) {
        currentUser.value = await response.json();
        loggedIn.value = true;

        await loadProjects();
        await loadActiveProject();
        if (activeProjectId.value) {
          await loadStories();
          if (stories.value.length > 0) {
            activeStoryId.value = stories.value[0].id;
            await loadTasks();
          }
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        authToken.value = null;
      }
    } catch (error) {
      console.error('Błąd sprawdzania tokenu:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      authToken.value = null;
    }
  }
});

function onLoginSuccess(userData: User) {
  currentUser.value = userData;
  loggedIn.value = true;

  loadProjects().then(() => {
    loadActiveProject().then(() => {
      if (activeProjectId.value) {
        loadStories().then(() => {
          if (stories.value.length > 0) {
            activeStoryId.value = stories.value[0].id;
            loadTasks();
          }
        });
      }
    });
  });
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  authToken.value = null;
  currentUser.value = null;
  loggedIn.value = false;

  projects.value = [];
  stories.value = [];
  tasks.value = [];
  activeProjectId.value = null;
  activeStoryId.value = null;
  resetForm();
  resetStoryForm();
  resetTaskForm();
}

async function loadProjects() {
  projects.value = await ProjectService.getAll();
}

async function loadActiveProject() {
  const savedProjectId = await ActiveProjectService.getActiveProject();
  if (savedProjectId && projects.value.some(p => p.id === savedProjectId)) {
    activeProjectId.value = savedProjectId;
  }
}

async function onSubmit() {
  if (form.value.id === null) {
    const newProject = {
      name: form.value.name,
      description: form.value.description
    };
    await ProjectService.add(newProject as Project);
  } else {
    await ProjectService.update({
      id: form.value.id,
      name: form.value.name,
      description: form.value.description
    });
  }
  await loadProjects();
  resetForm();
}

function resetForm() {
  form.value = {
    id: null,
    name: '',
    description: ''
  };
}

function editProject(project: Project) {
  form.value = {
    id: project.id,
    name: project.name,
    description: project.description
  };
}

async function deleteProject(id: string) {
  if (confirm('Czy na pewno chcesz usunąć ten projekt?')) {
    await ProjectService.delete(id);
    await loadProjects();
    if (activeProjectId.value === id) {
      activeProjectId.value = null;
      resetStoryView();
    }
  }
}

async function selectProject(project: Project) {
  activeProjectId.value = project.id;
  await ActiveProjectService.setActiveProject(project.id);
  await loadStories();
}

async function loadStories() {
  if (activeProjectId.value) {
    stories.value = await StoryService.getByProject(activeProjectId.value);
  }
}

async function onStorySubmit() {
  if (!activeProjectId.value) return;

  if (storyForm.value.id === null) {
    const newStory = {
      name: storyForm.value.name,
      description: storyForm.value.description,
      priority: storyForm.value.priority,
      status: storyForm.value.status,
      ownerId: storyForm.value.ownerId,
      projectId: activeProjectId.value
    };
    await StoryService.add(newStory as Story);
  } else {
    await StoryService.update({
      id: storyForm.value.id,
      name: storyForm.value.name,
      description: storyForm.value.description,
      priority: storyForm.value.priority,
      status: storyForm.value.status,
      ownerId: storyForm.value.ownerId,
      projectId: activeProjectId.value
    });
  }
  await loadStories();
  resetStoryForm();
}

function resetStoryForm() {
  storyForm.value = {
    id: null,
    name: '',
    description: '',
    priority: 'średni',
    status: 'todo',
    ownerId: null
  };
}

function editStory(story: Story) {
  storyForm.value = {
    id: story.id,
    name: story.name,
    description: story.description,
    priority: story.priority,
    status: story.status,
    ownerId: story.ownerId
  };
}

async function deleteStory(id: string) {
  if (confirm('Czy na pewno chcesz usunąć tę historyjkę?')) {
    await StoryService.delete(id);
    await loadStories();
    if (activeStoryId.value === id) {
      resetTaskView();
    }
  }
}

async function selectStory(story: Story) {
  activeStoryId.value = story.id;
  await loadTasks();
}

function resetStoryView() {
  stories.value = [];
  activeStoryId.value = null;
  resetTaskView();
}

async function loadTasks() {
  if (activeStoryId.value) {
    tasks.value = await TaskService.getByStory(activeStoryId.value);
  }
}

async function onTaskSubmit() {
  if (!activeStoryId.value) return;

  if (taskForm.value.id === null) {
    const newTask = {
      name: taskForm.value.name,
      description: taskForm.value.description,
      priority: taskForm.value.priority,
      state: taskForm.value.state,
      estimatedTime: taskForm.value.estimatedTime,
      assigneeId: taskForm.value.assigneeId,
      storyId: activeStoryId.value
    };
    await TaskService.add(newTask as Task);
  } else {
    await TaskService.update({
      id: taskForm.value.id,
      name: taskForm.value.name,
      description: taskForm.value.description,
      priority: taskForm.value.priority,
      state: taskForm.value.state,
      estimatedTime: taskForm.value.estimatedTime,
      assigneeId: taskForm.value.assigneeId,
      storyId: activeStoryId.value
    });
  }
  await loadTasks();
  resetTaskForm();
}

function resetTaskForm() {
  taskForm.value = {
    id: null,
    name: '',
    description: '',
    priority: 'średni',
    state: 'todo',
    estimatedTime: 1,
    assigneeId: null
  };
}

function editTask(task: Task) {
  taskForm.value = {
    id: task.id,
    name: task.name,
    description: task.description,
    priority: task.priority,
    state: task.state,
    estimatedTime: task.estimatedTime,
    assigneeId: task.assigneeId
  };
}

async function deleteTask(id: string) {
  if (confirm('Czy na pewno chcesz usunąć to zadanie?')) {
    await TaskService.delete(id);
    await loadTasks();
  }
}

function resetTaskView() {
  tasks.value = [];
  resetTaskForm();
}
</script>
