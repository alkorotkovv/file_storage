const fs = require('fs')
const path = require('path')
const {executeQuery} = require(__basedir + '/config/db_pg.js');

module.exports.getFilesList = async (req, res, next) => {
  
  const { folder_id } = req.params;

  const sqlQ = `select * from dbo.get_files_by_folder($1);`
  const values = [folder_id]

  try {
    const response = await executeQuery(sqlQ, values);
    const data = response?.rows
    res.send(data)
  }
  catch (err) {
    console.log(err);
    res.status(400).send({ error: err.message });
  }
};

module.exports.uploadFile = async (req, res, next) => {

  const {file} = req.files
  const {folder_id, description} = req.body

  const fileName = Buffer.from(file.name, 'binary').toString('utf8')
  const filePath = path.join(__basedir, 'library', fileName)
  let isSaved = false;

  if (fs.existsSync(filePath)) {
    console.log('Файл с таким именем ' + fileName + ' уже существует')
    return res.status(400).send({ error: 'Файл с таким именем уже существует' });
  }

  //Для проверки оставшегося места
  const sqlQ = `select * from dbo.get_folder_info($1);`
  const values = [folder_id]

  try {
    const response = await executeQuery(sqlQ, values)
    const data = response?.rows[0]
    const { total, used } = data;

    if (total !== null && (used + file.size) > total) {
      console.log('Превышен лимит хранилища')
      return res.status(403).send({error: 'Размер файла превышает размер свободного места'});
    }

    try {
      await file.mv(filePath, async (err) => {
        if (err) {
          console.log('Ошибка сохранения файла ' + fileName + ' на диске: ' + err)
          res.status(400).send({ error: 'Ошибка во время загрузки файла' });
        }

        isSaved = true;
        const sqlQ = `insert into dbo.library_files(folder_id, s_name, s_note, size, type, user_modified) values ($1, $2, $3, $4, $5, $6) returning *;`
        const values = [folder_id, fileName, description, file.size, fileName.split('.').pop(), req.session.uid]

        try {
          const dbResponse = await executeQuery(sqlQ, values)
          const data = dbResponse?.rows
          res.send(data)
        }
        catch (err) {
          console.log('Ошибка сохранения файла ' + fileName + ' в БД: ' + err)
          if (isSaved && fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
              res.status(400).send({ error: 'Ошибка во время загрузки файла' });
          }
        }
      })
    }
    catch (err) {
      console.log(err);
      res.status(400).send({ error: 'Ошибка во время загрузки файла' });
    }
  }
  catch (err) {
    console.log(err);
    res.status(400).send({ error: 'Ошибка во время загрузки файла' });
  };
};

module.exports.deleteFile = async (req, res, next) => {

  const { file_id } = req.params;
  
  const sqlQ1 = `select s_name FROM dbo.library_files WHERE id = $1;`
  const values1 = [file_id]
  
  const sqlQ2 = `delete FROM dbo.library_files WHERE id = $1;`
  const values2 = [file_id]
  
  try {
    // Получаем путь к файлу из БД
    const response = await executeQuery(sqlQ1, values1);

    if (!response.rows.length) {
      console.log('Файл не найден в БД')
      return res.status(400).send({ error: 'Файл не найден в БД'});
    }

    const fileName = response.rows[0].s_name
    const filePath = path.join(__basedir, 'library', fileName)

    // Удаляем файл с диска
    await fs.unlink(filePath, async (err) => {
      if (err) {
        console.log('Ошибка удаления файла ' + fileName + ' с диска')
        console.log(err)
        if (!fs.existsSync(filePath)) {
          try {
            const dbResponse = await executeQuery(sqlQ2, values2)
            const data = dbResponse?.rows
            res.send(data)
          }
          catch (err) {
            res.status(400).send({ error: err.message });
          }
        }        
        res.status(400).send({ error: err.message });
      }

      try {
        const dbResponse = await executeQuery(sqlQ2, values2)
        const data = dbResponse?.rows
        res.send(data)
      }
      catch (err) {
        res.status(400).send({ error: err.message });
      }

    })
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.downloadFile = async (req, res, next) => {

  const { file_id } = req.params;

  const sqlQ = `select s_name FROM dbo.library_files WHERE id = $1;`
  const values = [file_id]

  try {
    // Получаем имя файла из БД
    const response = await executeQuery(sqlQ, values);
    const fileName = response.rows[0].s_name
    const filePath = path.join(__basedir, 'library', fileName)

    res.download(filePath, (err) => {
      if (err) {
        console.log('Ошибка скачивания файла ' + fileName + ' с диска')
        res.status(500).json({ error: err.message });
      }
    })
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.openFile = async (req, res, next) => {

  const { file_id } = req.params;

  const sqlQ = `select s_name FROM dbo.library_files WHERE id = $1;`
  const values = [file_id]

  try {
    // Получаем имя файла из БД
    const response = await executeQuery(sqlQ, values);
    const fileName = response.rows[0].s_name
    const filePath = path.join(__basedir, 'library', fileName)

    res.sendFile(filePath, (err) => {
      if (err) {
        console.log('Ошибка открытия файла ' + fileName)
        res.status(500).json({ error: err.message });
      }
    })
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};