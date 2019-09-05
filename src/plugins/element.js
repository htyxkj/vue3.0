import Vue from "vue";
import {
  Alert,
  Aside,
  Button,
  ButtonGroup,
  Container,
  Input,
  InputNumber,
  Row,
  Col,
  Card,
  Checkbox,
  CheckboxButton,
  Dialog,
  Header,
  Main,
  Menu,
  Select,
  Option,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Loading,
  MessageBox,
  Message,
  Notification,
  Scrollbar,
  Tabs,
  Table,
  TableColumn,
  TabPane,
  Tooltip,
  Form,
  FormItem,
  DatePicker,
  TimePicker,
  Switch,
  Radio,
  Pagination,
  Upload,
  Tag,
//   Image,
  Step,
  Steps,
  CheckboxGroup,
  Badge,
  Popover,
  Progress,
  Transfer,

} from "element-ui";

Vue.use(Alert);
Vue.use(Aside);
Vue.use(Header);
Vue.use(Container);
Vue.use(Checkbox);
Vue.use(CheckboxButton)
Vue.use(Dialog);
Vue.use(Main);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(Select);
Vue.use(MenuItem);
Vue.use(MenuItemGroup);
Vue.use(Button);
Vue.use(ButtonGroup);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Row);
Vue.use(Col);
Vue.use(Card);
Vue.use(Scrollbar);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Tooltip);
Vue.use(Loading.directive);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Option);
Vue.use(DatePicker);
Vue.use(TimePicker);
Vue.use(Switch);
Vue.use(Radio);
Vue.use(Pagination);
Vue.use(Upload);
Vue.use(Tag);
// Vue.use(Image);
Vue.use(Step)
Vue.use(Steps)
Vue.use(CheckboxGroup)
Vue.use(Badge)
Vue.use(Popover)
Vue.use(Progress)
Vue.use(Transfer)

Vue.prototype.$loading = Loading.service;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;

