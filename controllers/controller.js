const fileController = {
  async getHomePage(req, res) {
    res.render("index");
  },

  async uploadFile(req, res) {
    console.log(req.file);

    res.redirect("/");
  },
};

export default fileController;
