import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { open } from "@tauri-apps/plugin-dialog"; // ファイルダイアログ用
import { invoke } from "@tauri-apps/api/core"; //rustバックエンドでの処理用

function Settings() {
    const [filePath, setFilePath] = useState("D:\\testspace\\csv_data"); // DB登録用のテキストデータのパス

    const selectFilePath = async () => {
        const selected = await open({
        directory: false,   // フォルダ選択モード
        multiple: false,   // 複数選択しない
        });

        if (selected) {
            setFilePath(selected); // 選択されたフォルダパスを state に反映
        }
    };

    // バックエンドにフォルダパスを送って登録処理を走らせる
    const registData = async () => {
        try {
            await invoke("register_data", { filePath: filePath }); //tauriでプログラムを走らせる
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Box>
        <Card>
            <CardContent>
            <Typography variant="h6" gutterBottom>
                ロット情報のDBへの登録
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                テキストデータのフォルダパスの入力
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <TextField
                size="small"
                label="フォルダパス"
                sx={{
                    width: 500,
                }}
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                />
                <Button
                variant="contained"
                color="primary"
                onClick={selectFilePath}
                >
                ファイル選択
                </Button>
            </Stack>
            <Button
                variant="contained"
                color="primary"
                disabled={!filePath}
                onClick={registData}
            >
                DBへデータを登録
            </Button>
            </CardContent>
        </Card>
        </Box>
    );
}

export default Settings;
