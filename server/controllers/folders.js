const {executeQuery} = require(__basedir + '/config/db_pg.js');

module.exports.getFoldersTree = async (req, res, next) => {
  const { folder_id } = req.params;

  const sqlQ = `select * from dbo.get_folders_tree($1) AS folders_tree;`
  const values = [folder_id]

  try {
    const response = await executeQuery(sqlQ, values);
    const data = response?.rows?.[0]?.folders_tree
    res.send(data)
  }
  catch (err) {
    console.log(err);
    res.status(400).send({ error: err.message });
  }
};

module.exports.getFolderInfo = async (req, res, next) => {
  const { folder_id } = req.params;

  const sqlQ = `select * from dbo.get_folder_info($1);`
  const values = [folder_id]

  try {
    const response = await executeQuery(sqlQ, values);
    const data = response?.rows[0]
    res.send(data)
  }
  catch (err) {
    console.log(err);
    res.status(400).send({ error: err.message });
  }
};