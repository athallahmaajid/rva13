import { Fragment, useEffect, useContext } from "react";
import { Context } from "../../../../utils/stateProvider";
import { useHistory } from "react-router-dom";
import { convMonth, updateTime } from "../../../../utils/dateConversion";
import { Button } from "react-bootstrap";
import { observer } from "mobx-react";
import Swal from "sweetalert2";
import axios from "axios";

function TableList() {
  const store = useContext(Context);
  const history = useHistory();

  useEffect(() => {
    axios
      .get("/admin/user/siswa", {
        headers: {
          Authorization: "Bearer " + store.token,
        },
      })
      .then((res) => res.data)
      .then(({ error, data }) => {
        if (!error) {
          if (store.dataSiswa.length < 1) {
            store.addDataSiswa(data);
          } else {
            if (JSON.stringify(store.dataSiswa) !== JSON.stringify(data)) {
              store.updateDataSiswa(data);
            }
          }
        }
      });
    // eslint-disable-next-line
  }, []);

  return (
    <Fragment>
      {store.dataSiswa.length > 0 &&
        store.dataSiswa.map((data, i) => {
          const date = new Date(data.date);

          return (
            <tr key={i}>
              <td>{data.absen}</td>
              <td>{data.kelas}</td>
              <td>{data.username}</td>
              <td>{data.email}</td>
              <td>
                {date.getDate()} {convMonth(date.getMonth())}{" "}
                {date.getFullYear()} {updateTime(date.getHours())}:
                {updateTime(date.getMinutes())}:{updateTime(date.getSeconds())}
              </td>
              <td>
                <Button
                  variant="success"
                  onClick={() => {
                    const index = store.getIndexSiswa(data._id);
                    history.push(`/vote/siswa/update/${index}`);
                  }}
                >
                  Ubah
                </Button>
                <Button
                  variant="danger"
                  onClick={() =>
                    Swal.fire(store.config.sweetal.Hapus).then((result) => {
                      if (result.isConfirmed) {
                        axios
                          .delete("/admin/user/siswa", {
                            headers: {
                              Authorization: "Bearer " + store.token,
                            },
                            data: { _id: data._id },
                          })
                          .then(({ data: d }) => {
                            store.deleteOneSiswa(data._id);
                            Swal.mixin(store.config.sweetal.Toaster).fire({
                              icon: "success",
                              title: d.message,
                            });
                          });
                      }
                    })
                  }
                >
                  Hapus
                </Button>
              </td>
            </tr>
          );
        })}
      {store.dataSiswa.length < 1 && (
        <tr>
          <td colSpan={6} className="text-center">
            Belum ada data siswa. Silahkan tambah siswa dengan menggunakan
            tombol diatas.
          </td>
        </tr>
      )}
    </Fragment>
  );
}

export default observer(TableList);
