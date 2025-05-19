import { FC, useState, useMemo } from 'react';
import moment from "moment";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Space,
  Tag,
  Input,
  Pagination,
  Empty,
  Spin
} from 'antd';
const { Search } = Input;
import {
  DeleteOutlined,
  FileOutlined,
  CloudDownloadOutlined,
  PlayCircleFilled
} from '@ant-design/icons';
import {
  useGetFilesListQuery,
  useDeleteFileMutation,
  useLazyDownloadFileQuery,
  useLazyOpenFileQuery
} from "../../store/api/libraryApi";
import { formatBytes } from '../../../../../utils/formatBytes';
import { getFileTypeColor } from '../../../../../utils/getFileTypeColor';

interface IProps {
  selectedFolder: string;
}

interface IFile {
  num: number;
  id: number;
  s_name: string;
  s_note: string;
  type: string;
  size: number;
  date_modified: string;
  user_modified_text: string;
}

const FileTable:FC<IProps> = ({ selectedFolder }) => {

  const { data, error, isLoading: isFilesLoading } = useGetFilesListQuery(selectedFolder);
  const [deleteFile, { isLoading: isDeleteFileLoading }] = useDeleteFileMutation();
  const [downloadFile] = useLazyDownloadFileQuery();
  const [openFile] = useLazyOpenFileQuery();

  const pageSize = 20;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>('');

  const filteredData = useMemo<IFile[] | undefined>(() => {
    return data?.filter((item: IFile) =>
      (Object.keys(item) as Array<keyof IFile>).filter(key => !['size'].includes(key)).some(key =>
        String(item[key]).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [data, searchText]);

  const handleDownload = async(id: number, name: string) => {
    try {
      const response = await downloadFile(id).unwrap();
      const url = window.URL.createObjectURL(response)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = name
      anchor.click()
      window.URL.revokeObjectURL(url)
    }
    catch (err) {
      console.log(err)
      message.error('Ошибка при скачивании файла');
    }
  };

  const handleDelete = async(id: number) => {
    try {
      const response = await deleteFile(id).unwrap();
      message.success('Файл успешно удален');
    }
    catch (err) {
      console.log(err)
      message.error('Ошибка при удалении файла');
    }
  };

  const handleOpen = async(id: number, name: string) => {
    try {
      const response = await openFile(id).unwrap();
      const url = window.URL.createObjectURL(response)
      window.open(url, '_blank');
    }
    catch (err) {
      console.log(err)
      message.error('Ошибка при скачивании файла');
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
      dataIndex: 's_name',
      key: 's_name',
      render: (s_name: string) => (
        <Space>
          <FileOutlined />
          <span style={{overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word'}}>{s_name}</span>
        </Space>
      ),
      sorter: (a: IFile, b: IFile) => a.s_name.localeCompare(b.s_name),
      width: '22%',
    },
    {
      title: 'Описание',
      dataIndex: 's_note',
      key: 's_note',
      sorter: (a: IFile, b: IFile) => (a.s_note).localeCompare(b.s_note),
      width: '22%',
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color={getFileTypeColor(type)}>{type}</Tag>,
      sorter: (a: IFile, b: IFile) => a.type.localeCompare(b.type),
      width: '6%',
    },
    {
      title: 'Размер',
      dataIndex: 'size',
      key: 'size',
      width: '8%',
      render: (value: number) => formatBytes(value),
      sorter: (a: IFile, b: IFile) => a.size - b.size
    },
    {
      title: 'Дата загрузки',
      dataIndex: 'date_modified',
      key: 'date_modified',
      width: '11%',
      render: (value: number) => moment(value).format('DD.MM.YY HH:mm'),
      sorter: (a: IFile, b: IFile) => new Date(a.date_modified).getTime() - new Date(b.date_modified).getTime(),
    },
    {
      title: 'Загрузил',
      dataIndex: 'user_modified_text',
      key: 'user_modified_text',
      width: '15%',
      sorter: (a: IFile, b: IFile) => a.user_modified_text.localeCompare(b.user_modified_text)
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (file: IFile) => (
        <>
          <Popconfirm
            title="Вы уверены, что хотите удалить этот файл?"
            onConfirm={() => handleDelete(file.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              danger
              icon={<DeleteOutlined style={{fontSize: '20px'}}/>}
              type="text"
              size='large'
            />
          </Popconfirm>
          <Button
            icon={<CloudDownloadOutlined style={{fontSize: '20px'}}/>}
            type="text"
            style={{color: 'royalblue'}}
            size='large'
            onClick={() => handleDownload(file.id, file.s_name)}
          />
          <Button
            icon={<PlayCircleFilled style={{fontSize: '20px'}}/>}
            type="text"
            style={{color: 'mediumseagreen'}}
            size='large'
            onClick={() => handleOpen(file.id, file.s_name)}
          />
        </>
      ),
    },
  ];

  return (
    <>
      {
        isFilesLoading 
            ? <Spin size="large" style={{display: 'flex', justifyContent: 'center', padding: '20%'}}/>
            : <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px 6px 8px',
              gap: 20,
            }}>
              <span style={{fontSize: '14px', marginRight: 'auto'}}>Всего файлов:
                <span style={{background: '#8b9dff', borderRadius: '8px', padding: '2px 10px', margin: '0 5px', color: 'white', fontWeight: '500'}}>
                  {filteredData?.length}
                </span>
              </span>
              <Search
                placeholder="Поиск"
                allowClear
                enterButton
                size="middle"
                onChange={(e) => setSearchText(e.target.value)}
                style={{width: '30%'}}
              />
              <Pagination
                current={currentPage}
                total={filteredData?.length}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
            <Table
              columns={columns}
              dataSource={filteredData?.slice((currentPage - 1) * pageSize, currentPage * pageSize)?.map((item, index) => ({...item, num: index + 1}))}
              rowKey="id"
              pagination={false}
              bordered
              scroll={{ x: 0, y: 'calc(100vh - 350px)' }}
              showSorterTooltip={false}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_DEFAULT}
                    description="Файлы отсутствуют"
                  />
                )
              }}
            />
        </>
      }      
    </>
  );
};

export default FileTable;