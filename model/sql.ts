interface ISql {
    [index :string] : string;
}

const TSql = {} as ISql;
TSql ['SkillFindAll'] = "select*from tbl_skill;";
TSql ['SkillFindByKode'] = "select*from tbl_skill where kode = $1;";
TSql ['SkillFindInKode'] = "select*from tbl_skill where kode in ($1,$2,$3);";
TSql ['BlogInfoFindAll'] = "select*from tbl_bloginfo;";
TSql ['InsUser'] = "insert into tbl_user(username,fullname,password) values ($1,$2,MD5($3));";
TSql ['SelUser'] = "select username, fullname from tbl_user where username=$1 and password=MD5($2);";
TSql ['InsKonten'] = "INSERT INTO public.tbl_konten("+
	"permalink, judul, kategori, deskripsi, konten, penulis, tgl_insert, tgl_update, status)"+
	"VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, 'DRAF');";
TSql ['UpdKonten'] = "UPDATE public.tbl_konten"+
	" SET permalink = $1, judul=$2, kategori=$3, deskripsi=$4, konten=$5, tgl_update=$6"+
	" WHERE permalink=$7;";
export default TSql;