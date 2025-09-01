import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Stack,
  LinearProgress,
} from "@mui/material";

export default function Downloads() {
  const [lotNumber, setLotNumber] = useState("");
  const [downloads, setDownloads] = useState([]);

  // 共通でタスク追加
  const addDownloadTask = (type, label) => {
    const taskId = Date.now(); // 簡易ID
    setDownloads((prev) => [
      ...prev,
      { id: taskId, type, label, status: "downloading" },
    ]);

    // ダミーで3秒後に完了にする（実際はAPIのレスポンスで更新）
    setTimeout(() => {
      setDownloads((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: "completed" } : t
        )
      );
    }, 3000);
  };

  return (
    <Box sx={{ mt: 4, display: "grid", gap: 3, maxWidth: 600 }}>
      {/* ロットデータ */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ロットデータのダウンロード
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1ロット分の稼働データをダウンロードします。
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            下記にロット番号を入力後、ダウンロードボタンを押してください。
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              label="ロット番号"
              fullWidth
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                addDownloadTask("lot", `ロット ${lotNumber}`)
              }
              disabled={lotNumber.length!=10}
            >
              ダウンロード開始
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* アラームデータ */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            アラームデータのダウンロード
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            全ロットのアラームデータをダウンロードします。
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => addDownloadTask("alarm", "アラームデータ")}
          >
            ダウンロード開始
          </Button>
        </CardContent>
      </Card>

      {/* ダウンロード中リスト */}
      {downloads.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ダウンロード状況
            </Typography>
            <Stack spacing={2}>
              {downloads.map((task) => (
                <Box key={task.id}>
                  <Typography variant="body2">
                    {task.label} —{" "}
                    {task.status === "downloading" ? "データ生成中..." : "完了"}
                  </Typography>
                  {task.status === "downloading" && (
                    <LinearProgress />
                  )}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
