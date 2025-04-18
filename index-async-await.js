import fs from 'fs/promises';
import path from 'path';
import url from 'url';

// Lấy các tham số từ dòng lệnh
const args = process.argv;

// Xác định __filename và currentWorkingDirectory
const __filename = url.fileURLToPath(import.meta.url);
const currentWorkingDirectory = path.dirname(__filename);

// Đường dẫn mặc định cho các tệp
const TODO_FILE = path.join(currentWorkingDirectory, 'todo.txt');
const DONE_FILE = path.join(currentWorkingDirectory, 'done.txt');

// Tạo file nếu chưa tồn tại
const createFileIfNotExists = async (filePath) => {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '');
  }
};

// Tạo các file cần thiết nếu chưa tồn tại
await createFileIfNotExists(TODO_FILE);
await createFileIfNotExists(DONE_FILE);

// Hàm hiển thị hướng dẫn sử dụng
const showHelp = () => {
  console.log(`
Usage :-
$ node index.js add "todo item"  # Thêm mới 1 todo
$ node index.js ls               # Hiện các todo đang có
$ node index.js del NUMBER       # Xóa 1 todo
$ node index.js done NUMBER      # Đánh dấu hoàn thành 1 todo
$ node index.js help             # Hiện bảng hướng dẫn sử dụng
$ node index.js report           # Thống kê
`);
};

// Hàm đọc dữ liệu từ file và trả về mảng các dòng không trống
const readFileLines = async (filePath) => {
  try {
    const fileData = await fs.readFile(filePath, 'utf-8');
    return fileData.trim() ? fileData.split('\n') : [];
  } catch (err) {
    console.error(`Error reading file: ${filePath}`);
    return [];
  }
};

// Hàm ghi dữ liệu vào file từ mảng
const writeFileLines = async (filePath, lines) => {
  try {
    await fs.writeFile(filePath, lines.join('\n'));
  } catch (err) {
    console.error(`Error writing to file: ${filePath}`);
  }
};

// Hàm hiển thị danh sách công việc
const listTodos = async () => {
  const todos = await readFileLines(TODO_FILE);
  if (todos.length === 0) {
    console.log('Không có việc nào cần làm!');
  } else {
    todos.forEach((todo, index) => {
      console.log(`${todos.length - index}. ${todo}`);
    });
  }
};

// Hàm thêm công việc mới
const addTodo = async () => {
  const newTask = args[3];
  if (!newTask) {
    console.log('Error: Bạn chưa nhập gì. Không có gì thêm vào!');
    return;
  }
  const todos = await readFileLines(TODO_FILE);
  todos.unshift(newTask);
  await writeFileLines(TODO_FILE, todos);
  console.log(`Added todo: "${newTask}"`);
};

// Hàm xóa công việc
const deleteTodo = async () => {
  const deleteIndex = parseInt(args[3], 10);
  const todos = await readFileLines(TODO_FILE);

  if (!deleteIndex || deleteIndex <= 0 || deleteIndex > todos.length) {
    console.log(`Error: todo #${deleteIndex} không tồn tại. Không thể xóa`);
    return;
  }

  const deleted = todos.splice(todos.length - deleteIndex, 1);
  await writeFileLines(TODO_FILE, todos);
  console.log(`Deleted todo #${deleteIndex}: "${deleted[0]}"`);
};

// Hàm đánh dấu hoàn thành công việc
const markDone = async () => {
  const doneIndex = parseInt(args[3], 10);
  const todos = await readFileLines(TODO_FILE);
  const doneTasks = await readFileLines(DONE_FILE);

  if (!doneIndex || doneIndex <= 0 || doneIndex > todos.length) {
    console.log(`Error: todo #${doneIndex} không tồn tại.`);
    return;
  }

  const completedTask = todos.splice(todos.length - doneIndex, 1)[0];
  const date = new Date().toISOString().substring(0, 10);
  doneTasks.unshift(`x ${date} ${completedTask}`);

  await writeFileLines(TODO_FILE, todos);
  await writeFileLines(DONE_FILE, doneTasks);
  console.log(`Đánh dấu todo #${doneIndex} đã hoàn thành: "${completedTask}"`);
};

// Hàm hiển thị báo cáo
const showReport = async () => {
  const todos = await readFileLines(TODO_FILE);
  const doneTasks = await readFileLines(DONE_FILE);
  const date = new Date().toISOString().substring(0, 10);
  console.log(`${date} Pending: ${todos.length} Completed: ${doneTasks.length}`);
};

// Xử lý theo tham số dòng lệnh
const command = args[2];
switch (command) {
  case 'add':
    await addTodo();
    break;
  case 'ls':
    await listTodos();
    break;
  case 'del':
    await deleteTodo();
    break;
  case 'done':
    await markDone();
    break;
  case 'help':
    showHelp();
    break;
  case 'report':
    await showReport();
    break;
  default:
    showHelp();
}