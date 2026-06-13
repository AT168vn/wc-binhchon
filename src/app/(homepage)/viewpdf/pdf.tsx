"use client";

import { Document, Page, View, Text, Image, PDFViewer, StyleSheet } from "@react-pdf/renderer";
import { useState, useEffect } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const imageSrc = `${siteUrl}/images_cks/TA1.2199.png`;

const styles = StyleSheet.create({
    body: {
        paddingTop: 20
    },
    image: {
        width: 64,
        height: 64
    }
});

const PDF = () => {
    return (
        <Document>
            <Page style={styles.body}>
                <View style={{ display: 'flex', justifyContent: "center" }}>
                    <Text wrap={false}>
                        Xin chào. đây là chữ ký của tôi
                    </Text>
                </View>
                <View>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image
                        src={imageSrc}
                        style={styles.image}
                    />
                </View>
            </Page>
        </Document>
    );
}

const PDFView = () => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient ? (
        <PDFViewer style={{ width: '100%', height: '100vh' }}>
            <PDF />
        </PDFViewer>
    ) : null;
}

export default PDFView;
