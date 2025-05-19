import { FC, useState } from 'react';
import {
  Upload,
  Button,
  Table,
  Space,
  Tag,
  Popconfirm,
  Empty,
  Input
} from 'antd';
const { Dragger } = Upload;
import {
  UploadOutlined,
  DeleteOutlined,
  FileOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd/es/upload/interface';
import { Spin } from 'antd';
import { useUploadFileMutation } from "../../store/api/libraryApi";
import { formatBytes } from "../../../../../utils/formatBytes";
import { getFileTypeColor } from '../../../../../utils/getFileTypeColor';

interface IProps {
  selectedFolder: string;
}

interface IFile extends UploadFile {
  num: number;
  id: string;
  description: string;
  type?: string;
  customStatus?: 'waiting' | 'loading' | 'success' | 'error';
  text: string;
}

interface IError {
  data?: {
    error?: string;
  };
  message?: string;
}

const FileUploader: FC<IProps> = ({ selectedFolder }) => {

  const [uploadFile, { isLoading }] = useUploadFileMutation();
  const [files, setFiles] = useState<IFile[]>([]);

  const handleBeforeUpload: UploadProps['beforeUpload'] = (file: File) => {
    // Проверка размера файла (например, не более 10MB)
    // const isValid = file.size / 1024 / 1024 < 10;
    // if (!isValid) {
    //   message.error('Файл должен быть меньше 10MB!');
    //   return Upload.LIST_IGNORE;
    // }
    return false; // Отключаем автоматическую загрузку
  };

  const handleFileChange: UploadProps['onChange'] = ({ fileList }) => {
    // Добавляем новые файлы в состояние
    const newFiles: IFile[] = fileList?.map((file, index) => ({
      ...file,
      num: index + 1,
      id: file.uid,
      name: file.name,
      size: file.size,
      originFileObj: file.originFileObj,
      description: '',
      type: file.name.split('.').pop(),
      customStatus: 'waiting',
      text: 'Ожидание загрузки на сервер'
    }));
    setFiles(newFiles);
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleDescriptionChange = (id: string, value: string) => {
    console.log(value)
    setFiles(files.map(file =>
      file.id === id ? { ...file, description: value } : file
    ));
  };

  const handleUpload = async() => {

    for (let i = 0; i < files.length; i++) {
      
      files[i].customStatus = 'loading';
      files[i].text = 'Загрузка...';
      setFiles([...files]);

      const formData = new FormData();
      formData.append('file', files[i].originFileObj!);
      formData.append(`description`, files[i].description);
      formData.append(`folder_id`, selectedFolder.toString());

      try {
        const response = await uploadFile(formData).unwrap();
        files[i].customStatus = 'success';
        files[i].text = 'Файл успешно загружен';
        setFiles([...files]);
      }
      catch (err) {
        const error = err as IError;
        files[i].customStatus = 'error';
        files[i].text = error?.data?.error ?? 'Ошибка во время загрузки файла';
        setFiles([...files]);
      }
    }
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'num',
      key: 'num',
      width: '4%',
    },
    {
      title: 'Имя файла',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <FileOutlined />
          <span style={{overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word'}}>{name}</span>
        </Space>
      ),
      sorter: (a: IFile, b: IFile) => a.name.localeCompare(b.name),
      width: '22%',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      render: (description: string, file: IFile) => (
        <Input
          value={file.description}
          onChange={(e) => handleDescriptionChange(file.id, e.target.value)}
        />
      ),
      sorter: (a: IFile, b: IFile) => (a.description).localeCompare(b.description),
      width: '20%',
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color={getFileTypeColor(type)}>{type}</Tag>,
      sorter: (a: IFile, b: IFile) => (a.type || '').localeCompare(b.type || ''),
      width: '6%',
    },
    {
      title: 'Размер',
      dataIndex: 'size',
      key: 'size',
      width: '10%',
      render: (size: number) => formatBytes(size),
      sorter: (a: IFile, b: IFile) => (a.size || 0) - (b.size || 0)
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: '30%',
      render: (status: string, file: IFile) => (
        <div style={{display: 'flex', gap: '6px'}}>
          {file.customStatus === 'waiting' && <ClockCircleOutlined style={{color: 'blue'}}/>}
          {file.customStatus === 'loading' && <Spin size="small"/>}
          {file.customStatus === 'success' && <CheckCircleFilled style={{color: 'green'}} />}
          {file.customStatus === 'error' && <CloseCircleFilled style={{color: 'red'}} />}
          <span>{file.text ?? ''}</span>
        </div>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (file: IFile) => (
        <Button
          danger
          icon={<DeleteOutlined style={{fontSize: '20px'}}/>}
          type="text"
          size='large'
          onClick={() => handleRemoveFile(file.id)}
        />
      ),
    },
  ];

  return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
      <Dragger
        multiple
        beforeUpload={handleBeforeUpload}
        onChange={handleFileChange}
        fileList={files.map(f => ({ ...f, status: 'done' }))}
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon"><UploadOutlined /></p>
        <p className="ant-upload-text">Нажмите или перетащите файлы в эту область</p>
        <p className="ant-upload-hint">Поддерживается загрузка нескольких файлов</p>
      </Dragger>
        <div style={{display: 'flex', gap: 8, padding: '0 8px', alignItems: 'center'}}>
          <span style={{fontSize: '14px', marginRight: 'auto'}}>Всего файлов:
            <span style={{background: '#8b9dff', borderRadius: '8px', padding: '2px 10px', margin: '0 5px', color: 'white', fontWeight: '500'}}>{files?.length}</span>
          </span>
          <Popconfirm
            title="Вы уверены, что хотите загрузить все файлы в выбранную папку?"
            onConfirm={handleUpload}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              type="primary"
              style={{width: '180px'}}
              disabled={files.length === 0}
              loading={isLoading}
            >
              Загрузить файлы
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Вы уверены, что хотите очистить список файлов?"
            onConfirm={() => setFiles([])}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              type="primary"
              danger
              style={{width: '180px'}}
              disabled={files.length === 0}
            >
              Очистить все
            </Button>
          </Popconfirm>

        </div>
        <Table
          columns={columns}
          dataSource={files?.map((item, index) => ({...item, num: index + 1}))}
          rowKey="id"
          pagination={false}
          bordered
          scroll={{ x: 0, y: 'calc(100vh - 550px)' }}
          showSorterTooltip={false}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_DEFAULT}
                description="Файлы для загрузки не выбраны"
              />
            )
          }}
        />
      </div>
  );
};

export default FileUploader;