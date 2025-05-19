import { FC } from 'react';
import { Progress } from 'antd';

interface IProps {
  selectedFolder: string;
  used: number;
  total?: number;
  loading?: boolean;
}

const formatStorage = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

const StorageProgress: FC<IProps> = ({ selectedFolder, used, total , loading}) => {

  const percent = total ? Math.min((used / total) * 100, 100) : 0;

  return (
    <div style={{width: '25%', padding: '6px'}}>
      {
        selectedFolder &&
        <div>
          <span>
            Использовано: {formatStorage(used)} / {total ? formatStorage(total) + ' [' + Math.round(percent * 10)  / 10 + '%]' : '∞'}
          </span>
          <Progress
            percent={total ? Math.round(percent * 10) / 10 : 10}
            format={() => ''}
            strokeColor={percent > 90 ? '#ff4d4f' : percent > 70 ? '#faad14' : '#54b67e'}
          />
        </div>
      }
    </div>
);
};

export default StorageProgress;