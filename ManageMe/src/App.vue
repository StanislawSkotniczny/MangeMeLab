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
  <div style="max-width: 1100px; margin: 40px auto;">
    <h1>ManageMe - Projekty</h1>
    <div style="margin-bottom: 20px;">
      <b>Zalogowany użytkownik:</b> {{ user.firstName }} {{ user.lastName }} ({{ user.role }})
    </div>
    <div style="margin-bottom: 20px;">
      <label><b>Wybierz aktywny projekt:</b></label>
      <select v-model.number="activeProjectId" @change="setActiveProject(Number(activeProjectId))">
        <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
      </select>
      <span v-if="activeProject"> ({{ activeProject.description }})</span>
    </div>
    <form @submit.prevent="onSubmit">
      <input v-model="form.name" placeholder="Nazwa projektu" required />
      <input v-model="form.description" placeholder="Opis projektu" required />
      <button type="submit">{{ form.id === null ? 'Dodaj projekt' : 'Aktualizuj projekt' }}</button>
      <button v-if="form.id !== null" type="button" @click="resetForm">Anuluj</button>
    </form>
    <ul>
      <li v-for="project in projects" :key="project.id" style="margin-bottom: 10px;">
        <b>{{ project.name }}</b>: {{ project.description }}
        <button @click="editProject(project)">Edytuj</button>
        <button @click="deleteProject(project.id)">Usuń</button>
      </li>
    </ul>
    <hr />
    <div v-if="activeProject">
      <h2>Historyjki dla projektu: {{ activeProject.name }}</h2>
      <form @submit.prevent="onStorySubmit">
        <input v-model="storyForm.name" placeholder="Nazwa historyjki" required />
        <input v-model="storyForm.description" placeholder="Opis" required />
        <select v-model="storyForm.priority">
          <option value="niski">Niski</option>
          <option value="średni">Średni</option>
          <option value="wysoki">Wysoki</option>
        </select>
        <button type="submit">{{ storyForm.id === null ? 'Dodaj historyjkę' : 'Aktualizuj historyjkę' }}</button>
        <button v-if="storyForm.id !== null" type="button" @click="resetStoryForm">Anuluj</button>
      </form>
      <div style="display: flex; gap: 30px; margin-top: 20px;">
        <div style="flex: 1;">
          <h3>Do zrobienia</h3>
          <ul>
            <li v-for="story in storiesTodo" :key="story.id">
              <b>{{ story.name }}</b> ({{ story.priority }})<br />
              {{ story.description }}<br />
              <small>Właściciel: {{ user.firstName }} {{ user.lastName }}</small><br />
              <button @click="editStory(story)">Edytuj</button>
              <button @click="deleteStory(story.id)">Usuń</button>
              <button @click="() => { activeStoryId = story.id; resetTaskView(); }">Zadania</button>
              <div style="margin-top: 8px;">
                <button @click="changeStoryState(story, 'doing')">Przenieś do 'w trakcie'</button>
                <button @click="changeStoryState(story, 'done')">Przenieś do 'zakończone'</button>
              </div>
            </li>
          </ul>
        </div>
        <div style="flex: 1;">
          <h3>W trakcie</h3>
          <ul>
            <li v-for="story in storiesDoing" :key="story.id">
              <b>{{ story.name }}</b> ({{ story.priority }})<br />
              {{ story.description }}<br />
              <small>Właściciel: {{ user.firstName }} {{ user.lastName }}</small><br />
              <button @click="editStory(story)">Edytuj</button>
              <button @click="deleteStory(story.id)">Usuń</button>
              <button @click="() => { activeStoryId = story.id; resetTaskView(); }">Zadania</button>
              <div style="margin-top: 8px;">
                <button @click="changeStoryState(story, 'todo')">Cofnij do 'do zrobienia'</button>
                <button @click="changeStoryState(story, 'done')">Przenieś do 'zakończone'</button>
              </div>
            </li>
          </ul>
        </div>
        <div style="flex: 1;">
          <h3>Zakończone</h3>
          <ul>
            <li v-for="story in storiesDone" :key="story.id">
              <b>{{ story.name }}</b> ({{ story.priority }})<br />
              {{ story.description }}<br />
              <small>Właściciel: {{ user.firstName }} {{ user.lastName }}</small><br />
              <button @click="editStory(story)">Edytuj</button>
              <button @click="deleteStory(story.id)">Usuń</button>
              <button @click="() => { activeStoryId = story.id; resetTaskView(); }">Zadania</button>
              <div style="margin-top: 8px;">
                <button @click="changeStoryState(story, 'doing')">Cofnij do 'w trakcie'</button>
                <button @click="changeStoryState(story, 'todo')">Cofnij do 'do zrobienia'</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-if="activeStory">
      <hr />
      <h2>Zadania dla historyjki: {{ activeStory.name }}</h2>
      <form @submit.prevent="onTaskSubmit">
        <input v-model="taskForm.name" placeholder="Nazwa zadania" required />
        <input v-model="taskForm.description" placeholder="Opis zadania" required />
        <select v-model="taskForm.priority">
          <option value="niski">Niski</option>
          <option value="średni">Średni</option>
          <option value="wysoki">Wysoki</option>
        </select>
        <input v-model.number="taskForm.estimatedTime" type="number" min="1" placeholder="Czas (h)" required style="width: 80px;" />
        <select v-model.number="taskForm.assigneeId">
          <option :value="null">Brak przypisania</option>
          <option v-for="u in devUsers" :key="u.id" :value="u.id">{{ u.firstName }} {{ u.lastName }} ({{ u.role }})</option>
        </select>
        <button type="submit">{{ taskForm.id === null ? 'Dodaj zadanie' : 'Aktualizuj zadanie' }}</button>
        <button v-if="taskForm.id !== null" type="button" @click="resetTaskForm">Anuluj</button>
      </form>
      <div style="display: flex; gap: 30px; margin-top: 20px;">
        <div style="flex: 1;">
          <h3>Do zrobienia</h3>
          <ul>
            <li v-for="task in tasksTodo" :key="task.id">
              <b>{{ task.name }}</b> ({{ task.priority }})<br />
              {{ task.description }}<br />
              <small>Przewidywany czas: {{ task.estimatedTime }}h</small><br />
              <button @click="editTask(task)">Edytuj</button>
              <button @click="deleteTask(task.id)">Usuń</button>
              <div>
                <label>Przypisz osobę:</label>
                <select @change="e => assignUserToTask(task, Number((e.target as HTMLSelectElement).value))">
                  <option :value="null">Brak</option>
                  <option v-for="u in devUsers" :key="u.id" :value="u.id">{{ u.firstName }} {{ u.lastName }} ({{ u.role }})</option>
                </select>
              </div>
              <div style="margin-top: 8px;">
                <button @click="assignUserToTask(task, task.assigneeId ?? user.id)">Przenieś do 'w trakcie'</button>
                <button @click="markTaskDone(task)">Przenieś do 'zakończone'</button>
              </div>
            </li>
          </ul>
        </div>
        <div style="flex: 1;">
          <h3>W trakcie</h3>
          <ul>
            <li v-for="task in tasksDoing" :key="task.id">
              <b>{{ task.name }}</b> ({{ task.priority }})<br />
              {{ task.description }}<br />
              <small>Przewidywany czas: {{ task.estimatedTime }}h</small><br />
              <small>Start: {{ task.startDate ? (new Date(task.startDate)).toLocaleString() : '-' }}</small><br />
              <small>Przypisany: {{ users.find(u => u.id === task.assigneeId)?.firstName }} {{ users.find(u => u.id === task.assigneeId)?.lastName }}</small><br />
              <button @click="editTask(task)">Edytuj</button>
              <button @click="deleteTask(task.id)">Usuń</button>
              <button @click="markTaskDone(task)">Zakończ</button>
              <div style="margin-top: 8px;">
                <button @click="TaskService.update({ ...task, state: 'todo' }); loadTasks();">Cofnij do 'do zrobienia'</button>
                <button @click="markTaskDone(task)">Przenieś do 'zakończone'</button>
              </div>
            </li>
          </ul>
        </div>
        <div style="flex: 1;">
          <h3>Zakończone</h3>
          <ul>
            <li v-for="task in tasksDone" :key="task.id">
              <b>{{ task.name }}</b> ({{ task.priority }})<br />
              {{ task.description }}<br />
              <small>Przewidywany czas: {{ task.estimatedTime }}h</small><br />
              <small>Start: {{ task.startDate ? (new Date(task.startDate)).toLocaleString() : '-' }}</small><br />
              <small>Koniec: {{ task.endDate ? (new Date(task.endDate)).toLocaleString() : '-' }}</small><br />
              <small>Przypisany: {{ users.find(u => u.id === task.assigneeId)?.firstName }} {{ users.find(u => u.id === task.assigneeId)?.lastName }}</small><br />
              <button @click="editTask(task)">Edytuj</button>
              <button @click="deleteTask(task.id)">Usuń</button>
              <div style="margin-top: 8px;">
                <button @click="TaskService.update({ ...task, state: 'doing', endDate: undefined }); loadTasks();">Cofnij do 'w trakcie'</button>
                <button @click="TaskService.update({ ...task, state: 'todo', endDate: undefined, startDate: undefined, assigneeId: undefined }); loadTasks();">Cofnij do 'do zrobienia'</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input, select {
  margin: 0 5px 10px 0;
  padding: 4px 8px;
}
button {
  margin-left: 5px;
}
form {
  margin-bottom: 20px;
}
</style>
