import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { Plus, Trash2, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

const MARKET_TEMPLATE = {
    marketName: '',
    location: '',
    distance: '',
    accessibility: '',
    mainCommodities: '',
    priceChanges: '',
    supplyStatus: '',
    demandTrends: '',
    tradingVolume: '',
    marketDays: '',
    transportCost: '',
    marketCondition: '',
    notes: ''
};

export default function MarketsSection({ formData = {}, onUpdate }) {
    const [markets, setMarkets] = useState(
        formData.markets && formData.markets.length >= 2 
            ? formData.markets 
            : [{ ...MARKET_TEMPLATE, id: 1 }, { ...MARKET_TEMPLATE, id: 2 }]
    );

    const addMarket = () => {
        const newMarket = {
            ...MARKET_TEMPLATE,
            id: Date.now()
        };
        const updatedMarkets = [...markets, newMarket];
        setMarkets(updatedMarkets);
        onUpdate?.({ markets: updatedMarkets });
    };

    const removeMarket = (id) => {
        if (markets.length <= 2) {
            Alert.alert(
                'Minimum Markets Required',
                'At least two markets must be assessed.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Remove Market',
            'Are you sure you want to remove this market assessment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        const updatedMarkets = markets.filter(m => m.id !== id);
                        setMarkets(updatedMarkets);
                        onUpdate?.({ markets: updatedMarkets });
                    }
                }
            ]
        );
    };

    const updateMarket = (id, field, value) => {
        const updatedMarkets = markets.map(market =>
            market.id === id ? { ...market, [field]: value } : market
        );
        setMarkets(updatedMarkets);
        onUpdate?.({ markets: updatedMarkets });
    };

    const renderMarketCard = (market, index) => (
        <View key={market.id} style={styles.marketCard}>
            <View style={styles.marketHeader}>
                <View style={styles.marketHeaderLeft}>
                    <View style={styles.marketBadge}>
                        <Text style={styles.marketBadgeText}>Market {index + 1}</Text>
                    </View>
                    {market.marketName ? (
                        <Text style={styles.marketName}>{market.marketName}</Text>
                    ) : null}
                </View>
                {markets.length > 2 && (
                    <TouchableOpacity
                        onPress={() => removeMarket(market.id)}
                        style={styles.removeButton}
                    >
                        <Trash2 size={18} color={COLORS.error} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Market Identification */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Market Identification</Text>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Market Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter market name"
                        value={market.marketName}
                        onChangeText={(text) => updateMarket(market.id, 'marketName', text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location/Village *</Text>
                    <View style={styles.inputWithIcon}>
                        <MapPin size={18} color={COLORS.textLight} />
                        <TextInput
                            style={[styles.input, styles.inputWithIconPadding]}
                            placeholder="Enter location"
                            value={market.location}
                            onChangeText={(text) => updateMarket(market.id, 'location', text)}
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, styles.halfWidth]}>
                        <Text style={styles.label}>Distance (km)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            keyboardType="numeric"
                            value={market.distance}
                            onChangeText={(text) => updateMarket(market.id, 'distance', text)}
                        />
                    </View>

                    <View style={[styles.inputGroup, styles.halfWidth]}>
                        <Text style={styles.label}>Accessibility</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Good/Fair/Poor"
                            value={market.accessibility}
                            onChangeText={(text) => updateMarket(market.id, 'accessibility', text)}
                        />
                    </View>
                </View>
            </View>

            {/* Market Activity */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Market Activity</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Main Commodities Traded</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="List main commodities (e.g., maize, beans, livestock)"
                        multiline
                        numberOfLines={3}
                        value={market.mainCommodities}
                        onChangeText={(text) => updateMarket(market.id, 'mainCommodities', text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Market Days</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Monday, Thursday"
                        value={market.marketDays}
                        onChangeText={(text) => updateMarket(market.id, 'marketDays', text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Trading Volume</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="High/Medium/Low"
                        value={market.tradingVolume}
                        onChangeText={(text) => updateMarket(market.id, 'tradingVolume', text)}
                    />
                </View>
            </View>

            {/* Price & Supply Information */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Price & Supply Information</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Price Changes (Last 3 Months)</Text>
                    <View style={styles.trendButtons}>
                        <TouchableOpacity
                            style={[
                                styles.trendButton,
                                market.priceChanges === 'increasing' && styles.trendButtonActive
                            ]}
                            onPress={() => updateMarket(market.id, 'priceChanges', 'increasing')}
                        >
                            <TrendingUp size={16} color={market.priceChanges === 'increasing' ? '#fff' : COLORS.primary} />
                            <Text style={[
                                styles.trendButtonText,
                                market.priceChanges === 'increasing' && styles.trendButtonTextActive
                            ]}>Increasing</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.trendButton,
                                market.priceChanges === 'stable' && styles.trendButtonActive
                            ]}
                            onPress={() => updateMarket(market.id, 'priceChanges', 'stable')}
                        >
                            <Minus size={16} color={market.priceChanges === 'stable' ? '#fff' : COLORS.textLight} />
                            <Text style={[
                                styles.trendButtonText,
                                market.priceChanges === 'stable' && styles.trendButtonTextActive
                            ]}>Stable</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.trendButton,
                                market.priceChanges === 'decreasing' && styles.trendButtonActive
                            ]}
                            onPress={() => updateMarket(market.id, 'priceChanges', 'decreasing')}
                        >
                            <TrendingDown size={16} color={market.priceChanges === 'decreasing' ? '#fff' : COLORS.error} />
                            <Text style={[
                                styles.trendButtonText,
                                market.priceChanges === 'decreasing' && styles.trendButtonTextActive
                            ]}>Decreasing</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Supply Status</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Abundant/Adequate/Scarce"
                        value={market.supplyStatus}
                        onChangeText={(text) => updateMarket(market.id, 'supplyStatus', text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Demand Trends</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="High/Medium/Low"
                        value={market.demandTrends}
                        onChangeText={(text) => updateMarket(market.id, 'demandTrends', text)}
                    />
                </View>
            </View>

            {/* Market Conditions */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Market Conditions</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Transport Cost to Market</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter cost in local currency"
                        keyboardType="numeric"
                        value={market.transportCost}
                        onChangeText={(text) => updateMarket(market.id, 'transportCost', text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Overall Market Condition</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Excellent/Good/Fair/Poor"
                        value={market.marketCondition}
                        onChangeText={(text) => updateMarket(market.id, 'marketCondition', text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Additional Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Any additional observations about this market"
                        multiline
                        numberOfLines={4}
                        value={market.notes}
                        onChangeText={(text) => updateMarket(market.id, 'notes', text)}
                    />
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Markets & Trade Assessment</Text>
                <Text style={styles.headerSubtitle}>
                    Assess at least two markets in the area
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {markets.map((market, index) => renderMarketCard(market, index))}

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={addMarket}
                >
                    <Plus size={20} color={COLORS.primary} />
                    <Text style={styles.addButtonText}>Add Another Market</Text>
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        💡 Tip: Assess multiple markets to get a comprehensive view of trade dynamics in the area.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    marketCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    marketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    marketHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    marketBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    marketBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    marketName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        flex: 1,
    },
    removeButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#fef2f2',
    },
    section: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#111827',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        gap: 8,
    },
    inputWithIconPadding: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: 0,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    trendButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    trendButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#fff',
        gap: 6,
    },
    trendButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    trendButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4b5563',
    },
    trendButtonTextActive: {
        color: '#fff',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        backgroundColor: '#f0f9ff',
        gap: 8,
        marginBottom: 16,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    infoBox: {
        backgroundColor: '#fffbeb',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#fef3c7',
        marginBottom: 20,
    },
    infoText: {
        fontSize: 14,
        color: '#92400e',
        lineHeight: 20,
    },
});
